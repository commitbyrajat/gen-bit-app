import { WrenAIDeployStatusEnum } from '@server/models/adaptor';
import { IWrenAIAdaptor } from '../adaptors/wrenAIAdaptor';
import {
  Deploy,
  DeployStatusEnum,
  IDeployLogRepository,
} from '../repositories/deployLogRepository';
import { IProjectRepository } from '../repositories/projectRepository';
import { Manifest } from '../mdl/type';
import { createHash } from 'node:crypto';
import { getLogger } from '@server/utils';
import {
  PostHogTelemetry,
  TelemetryEvent,
  WrenService,
} from '../telemetry/telemetry';

const logger = getLogger('DeployService');
logger.level = 'debug';

export interface DeployResponse {
  status: DeployStatusEnum;
  error?: string;
}

export interface MDLSyncResponse {
  isSyncronized: boolean;
}

export interface IDeployService {
  deploy(
    manifest: Manifest,
    projectId: number,
    force?: boolean,
  ): Promise<DeployResponse>;
  getLastDeployment(projectId: number): Promise<Deploy>;
  getInProgressDeployment(projectId: number): Promise<Deploy>;
  createMDLHash(manifest: Manifest, projectId: number): string;
  getMDLByHash(hash: string): Promise<string>;
  deleteAllByProjectId(projectId: number): Promise<void>;
}

export class DeployService implements IDeployService {
  private wrenAIAdaptor: IWrenAIAdaptor;
  private deployLogRepository: IDeployLogRepository;
  private projectRepository: IProjectRepository;
  private telemetry: PostHogTelemetry;

  constructor({
    wrenAIAdaptor,
    deployLogRepository,
    projectRepository,
    telemetry,
  }: {
    wrenAIAdaptor: IWrenAIAdaptor;
    deployLogRepository: IDeployLogRepository;
    projectRepository: IProjectRepository;
    telemetry: PostHogTelemetry;
  }) {
    this.wrenAIAdaptor = wrenAIAdaptor;
    this.deployLogRepository = deployLogRepository;
    this.projectRepository = projectRepository;
    this.telemetry = telemetry;
  }

  public async getLastDeployment(projectId) {
    const lastDeploy =
      await this.deployLogRepository.findLastProjectDeployLog(projectId);
    if (!lastDeploy) {
      return null;
    }
    return lastDeploy;
  }

  public async getInProgressDeployment(projectId) {
    return await this.deployLogRepository.findInProgressProjectDeployLog(
      projectId,
    );
  }

  public async deploy(manifest, projectId, force = false) {
    const eventName = TelemetryEvent.MODELING_DEPLOY_MDL;
    try {
      // generate hash of manifest
      const hash = this.createMDLHash(manifest, projectId);
      logger.info(
        `MDL deploy requested projectId=${projectId} hash=${hash} force=${force} models=${manifest.models?.length || 0} relationships=${manifest.relationships?.length || 0} views=${manifest.views?.length || 0}`,
      );

      if (!force) {
        // check if the model current deployment
        const lastDeploy =
          await this.deployLogRepository.findLastProjectDeployLog(projectId);
        if (lastDeploy && lastDeploy.hash === hash) {
          logger.info(
            `MDL deploy skipped projectId=${projectId} hash=${hash} reason=same_hash storage=deploy_log.manifest deployLogId=${lastDeploy.id}`,
          );
          return { status: DeployStatusEnum.SUCCESS };
        }
      }
      const deployData = {
        manifest,
        hash,
        projectId,
        status: DeployStatusEnum.IN_PROGRESS,
      } as Deploy;
      const deploy = await this.deployLogRepository.createOne(deployData);
      logger.info(
        `MDL stored projectId=${projectId} hash=${hash} storage=deploy_log.manifest deployLogId=${deploy.id} status=${DeployStatusEnum.IN_PROGRESS}`,
      );

      // deploy to AI-service
      logger.info(
        `MDL handoff to AI service projectId=${projectId} hash=${hash} deployLogId=${deploy.id}`,
      );
      const project = await this.projectRepository.findOneBy({ id: projectId });
      const { status: aiStatus, error: aiError } =
        await this.wrenAIAdaptor.deploy({
          manifest,
          hash,
          projectId,
          tenantId: project?.tenantId,
        });

      // update deploy status
      const status =
        aiStatus === WrenAIDeployStatusEnum.SUCCESS
          ? DeployStatusEnum.SUCCESS
          : DeployStatusEnum.FAILED;
      await this.deployLogRepository.updateOne(deploy.id, {
        status,
        error: aiError,
      });
      logger.info(
        `MDL deploy completed projectId=${projectId} hash=${hash} deployLogId=${deploy.id} aiStatus=${aiStatus} storedStatus=${status}`,
      );

      // telemetry
      if (status === DeployStatusEnum.SUCCESS) {
        this.telemetry.sendEvent(eventName);
      } else {
        this.telemetry.sendEvent(
          eventName,
          { mdl: manifest, error: aiError },
          WrenService.AI,
          false,
        );
      }
      return { status, error: aiError };
    } catch (err: any) {
      logger.error(
        `MDL deploy failed projectId=${projectId} error=${err.message}`,
      );
      this.telemetry.sendEvent(
        eventName,
        { mdl: manifest, error: err.message },
        err.extensions?.service,
        false,
      );
      return { status: DeployStatusEnum.FAILED, error: err.message };
    }
  }

  public createMDLHash(manifest: Manifest, projectId: number) {
    const manifestStr = JSON.stringify(manifest);
    const content = `${projectId} ${manifestStr}`;
    const hash = createHash('sha1').update(content).digest('hex');
    return hash;
  }

  public async getMDLByHash(hash: string) {
    const deploy = await this.deployLogRepository.findOneBy({ hash });
    if (!deploy) {
      return null;
    }
    // return base64 encoded manifest
    return Buffer.from(JSON.stringify(deploy.manifest)).toString('base64');
  }

  public async deleteAllByProjectId(projectId: number): Promise<void> {
    // delete all deploy logs
    await this.deployLogRepository.deleteAllBy({ projectId });
  }
}

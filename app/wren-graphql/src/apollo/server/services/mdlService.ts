import { MDLBuilder } from '../mdl/mdlBuilder';
import {
  IModelNestedColumnRepository,
  IModelColumnRepository,
  IModelRepository,
  IProjectRepository,
  IRelationRepository,
  IViewRepository,
} from '../repositories';
import { Manifest } from '../mdl/type';
import { getLogger } from '@server/utils';
import { Project } from '../repositories/projectRepository';

const logger = getLogger('MDLService');
logger.level = 'debug';

export interface MakeCurrentModelMDLResult {
  manifest: Manifest;
  mdlBuilder: MDLBuilder;
}
export interface IMDLService {
  makeCurrentModelMDL(project?: Project): Promise<MakeCurrentModelMDLResult>;
}

export class MDLService implements IMDLService {
  private projectRepository: IProjectRepository;
  private modelRepository: IModelRepository;
  private modelColumnRepository: IModelColumnRepository;
  private modelNestedColumnRepository: IModelNestedColumnRepository;
  private relationRepository: IRelationRepository;
  private viewRepository: IViewRepository;

  constructor({
    projectRepository,
    modelRepository,
    modelColumnRepository,
    modelNestedColumnRepository,
    relationRepository,
    viewRepository,
  }: {
    projectRepository: IProjectRepository;
    modelRepository: IModelRepository;
    modelColumnRepository: IModelColumnRepository;
    modelNestedColumnRepository: IModelNestedColumnRepository;
    relationRepository: IRelationRepository;
    viewRepository: IViewRepository;
  }) {
    this.projectRepository = projectRepository;
    this.modelRepository = modelRepository;
    this.modelColumnRepository = modelColumnRepository;
    this.modelNestedColumnRepository = modelNestedColumnRepository;
    this.relationRepository = relationRepository;
    this.viewRepository = viewRepository;
  }

  public async makeCurrentModelMDL(selectedProject?: Project) {
    const project =
      selectedProject || (await this.projectRepository.getCurrentProject());
    const projectId = project.id;
    logger.info(
      `MDL generation started projectId=${projectId} source=ui_metadata_tables storage=pending`,
    );
    const models = await this.modelRepository.findAllBy({ projectId });
    const modelIds = models.map((m) => m.id);
    const columns =
      await this.modelColumnRepository.findColumnsByModelIds(modelIds);
    const modelNestedColumns =
      await this.modelNestedColumnRepository.findNestedColumnsByModelIds(
        modelIds,
      );
    const relations = await this.relationRepository.findRelationInfoBy({
      projectId,
    });
    const views = await this.viewRepository.findAllBy({ projectId });
    logger.info(
      `MDL input loaded projectId=${projectId} models=${models.length} columns=${columns.length} nestedColumns=${modelNestedColumns.length} relations=${relations.length} views=${views.length}`,
    );
    const relatedModels = models;
    const relatedColumns = columns;
    const relatedRelations = relations;
    const mdlBuilder = new MDLBuilder({
      project,
      models,
      columns,
      nestedColumns: modelNestedColumns,
      relations,
      views,
      relatedModels,
      relatedColumns,
      relatedRelations,
    });
    const manifest = mdlBuilder.build();
    logger.info(
      `MDL generated projectId=${projectId} models=${manifest.models?.length || 0} relationships=${manifest.relationships?.length || 0} views=${manifest.views?.length || 0} storage=memory next_storage=deploy_log.manifest`,
    );
    return { manifest, mdlBuilder };
  }
}

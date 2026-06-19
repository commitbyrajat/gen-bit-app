/** 
    This class is responsible for handling the retrieval of metadata from the data source.
    For DuckDB, we control the access logic and directly query the WrenEngine.
    For PostgreSQL and BigQuery, we will use the Ibis server API.
 */

import { IIbisAdaptor } from '../adaptors/ibisAdaptor';
import { IWrenEngineAdaptor } from '../adaptors/wrenEngineAdaptor';
import { Project } from '../repositories';
import { DataSourceName } from '../types';
import { getLogger } from '@server/utils';

const logger = getLogger('MetadataService');
logger.level = 'debug';

export interface CompactColumn {
  name: string;
  type: string;
  notNull: boolean;
  description?: string;
  properties?: Record<string, any>;
  nestedColumns?: CompactColumn[];
}

export enum ConstraintType {
  PRIMARY_KEY = 'PRIMARY KEY',
  FOREIGN_KEY = 'FOREIGN KEY',
  UNIQUE = 'UNIQUE',
}

export interface CompactTable {
  name: string;
  columns: CompactColumn[];
  description?: string;
  properties?: Record<string, any>;
  primaryKey?: string;
}

export interface RecommendConstraint {
  constraintName: string;
  constraintType: ConstraintType;
  constraintTable: string;
  constraintColumn: string;
  constraintedTable: string;
  constraintedColumn: string;
}

export interface IDataSourceMetadataService {
  listTables(project: Project): Promise<CompactTable[]>;
  listConstraints(project: Project): Promise<RecommendConstraint[]>;
  getVersion(project: Project): Promise<string>;
}

export class DataSourceMetadataService implements IDataSourceMetadataService {
  private readonly ibisAdaptor: IIbisAdaptor;
  private readonly wrenEngineAdaptor: IWrenEngineAdaptor;

  constructor({
    ibisAdaptor,
    wrenEngineAdaptor,
  }: {
    ibisAdaptor: IIbisAdaptor;
    wrenEngineAdaptor: IWrenEngineAdaptor;
  }) {
    this.ibisAdaptor = ibisAdaptor;
    this.wrenEngineAdaptor = wrenEngineAdaptor;
  }

  public async listTables(project): Promise<CompactTable[]> {
    const { type: dataSource } = project;
    const connectionInfo = this.getIbisConnectionInfo(project);
    if (dataSource === DataSourceName.DUCKDB) {
      logger.info(
        `Metadata listTables requested projectId=${project.id} dataSource=${dataSource} engine=wren-engine`,
      );
      const tables = await this.wrenEngineAdaptor.listTables();
      logger.info(
        `Metadata listTables completed projectId=${project.id} dataSource=${dataSource} tables=${tables.length}`,
      );
      return tables;
    }
    logger.info(
      `Metadata listTables requested projectId=${project.id} dataSource=${dataSource} toolkitProfileId=${project.toolkitProfileId || 'inline'}`,
    );
    const tables = await this.ibisAdaptor.getTables(dataSource, connectionInfo);
    logger.info(
      `Metadata listTables completed projectId=${project.id} dataSource=${dataSource} toolkitProfileId=${project.toolkitProfileId || 'inline'} tables=${tables.length}`,
    );
    return tables;
  }

  public async listConstraints(
    project: Project,
  ): Promise<RecommendConstraint[]> {
    const { type: dataSource } = project;
    const connectionInfo = this.getIbisConnectionInfo(project);
    if (dataSource === DataSourceName.DUCKDB) {
      logger.info(
        `Metadata listConstraints skipped projectId=${project.id} dataSource=${dataSource} reason=duckdb_not_supported`,
      );
      return [];
    }
    logger.info(
      `Metadata listConstraints requested projectId=${project.id} dataSource=${dataSource} toolkitProfileId=${project.toolkitProfileId || 'inline'}`,
    );
    const constraints = await this.ibisAdaptor.getConstraints(
      dataSource,
      connectionInfo,
    );
    logger.info(
      `Metadata listConstraints completed projectId=${project.id} dataSource=${dataSource} toolkitProfileId=${project.toolkitProfileId || 'inline'} constraints=${constraints.length}`,
    );
    return constraints;
  }

  public async getVersion(project: Project): Promise<string> {
    const { type: dataSource } = project;
    const connectionInfo = this.getIbisConnectionInfo(project);
    logger.info(
      `Metadata getVersion requested projectId=${project.id} dataSource=${dataSource} toolkitProfileId=${project.toolkitProfileId || 'inline'}`,
    );
    const version = await this.ibisAdaptor.getVersion(
      dataSource,
      connectionInfo,
    );
    logger.info(
      `Metadata getVersion completed projectId=${project.id} dataSource=${dataSource} toolkitProfileId=${project.toolkitProfileId || 'inline'} version=${version || 'unknown'}`,
    );
    return version;
  }

  private getIbisConnectionInfo(project: Project) {
    if (!project.toolkitProfileId) {
      return project.connectionInfo;
    }
    return {
      ...project.connectionInfo,
      toolkitProfileId: project.toolkitProfileId,
    };
  }
}

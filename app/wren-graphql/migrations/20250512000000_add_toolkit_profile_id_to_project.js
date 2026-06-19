/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('project', (table) => {
    table
      .string('toolkit_profile_id')
      .nullable()
      .comment('Toolkit profile id for this project datasource connection');
    table.index(['toolkit_profile_id'], 'project_toolkit_profile_id_idx');
  });

  const projects = await knex('project').select('id', 'connection_info');
  for (const project of projects) {
    const connectionInfo =
      typeof project.connection_info === 'string'
        ? JSON.parse(project.connection_info || '{}')
        : project.connection_info || {};
    if (connectionInfo.toolkitProfileId) {
      await knex('project')
        .where({ id: project.id })
        .update({ toolkit_profile_id: connectionInfo.toolkitProfileId });
      delete connectionInfo.toolkitProfileId;
      await knex('project')
        .where({ id: project.id })
        .update({
          connection_info:
            process.env.DB_TYPE === 'pg'
              ? connectionInfo
              : JSON.stringify(connectionInfo),
        });
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('project', (table) => {
    table.dropIndex(['toolkit_profile_id'], 'project_toolkit_profile_id_idx');
    table.dropColumn('toolkit_profile_id');
  });
};

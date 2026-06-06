jest.mock(
  '@/utils/rbac',
  () => ({
    Role: {
      PLATFORM_SUPER_ADMIN: 'PLATFORM_SUPER_ADMIN',
    },
  }),
  { virtual: true },
);

import { DiagramResolver } from '../diagramResolver';

describe('DiagramResolver', () => {
  it('loads models from the requested connection instead of the current project', async () => {
    const resolver = new DiagramResolver();
    const requestedProject = { id: 29, tenantId: 1 };
    const requestedModels = [{ id: 101, projectId: 29 }];
    const ctx = {
      auth: {
        user: {
          roles: ['PLATFORM_SUPER_ADMIN'],
        },
      },
      projectService: {
        getProjectById: jest.fn().mockResolvedValue(requestedProject),
        getCurrentProject: jest.fn(),
      },
      modelRepository: {
        findAllBy: jest.fn().mockResolvedValue(requestedModels),
      },
      modelColumnRepository: {
        findColumnsByModelIds: jest.fn().mockResolvedValue([]),
      },
      modelNestedColumnRepository: {
        findNestedColumnsByModelIds: jest.fn().mockResolvedValue([]),
      },
      relationRepository: {
        findRelationInfoBy: jest.fn().mockResolvedValue([]),
      },
      viewRepository: {
        findAllBy: jest.fn().mockResolvedValue([]),
      },
    };
    const expectedDiagram = { models: [], views: [] };
    jest
      .spyOn(resolver as any, 'buildDiagram')
      .mockReturnValue(expectedDiagram);

    const result = await resolver.getDiagram(
      null,
      { connectionId: 29 },
      ctx as any,
    );

    expect(ctx.projectService.getProjectById).toHaveBeenCalledWith(29);
    expect(ctx.projectService.getCurrentProject).not.toHaveBeenCalled();
    expect(ctx.modelRepository.findAllBy).toHaveBeenCalledWith({
      projectId: 29,
    });
    expect(result).toBe(expectedDiagram);
  });
});

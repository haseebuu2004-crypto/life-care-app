jest.mock('./shared/services/cronService', () => ({
    init: jest.fn(),
    runScheduledBackup: jest.fn()
}));

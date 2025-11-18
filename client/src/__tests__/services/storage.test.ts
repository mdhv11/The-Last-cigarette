import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  clearAllStorage,
  STORAGE_KEYS,
} from '../../services/storage';

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveToStorage', () => {
    it('should save data to AsyncStorage', async () => {
      const testData = { name: 'Test User', email: 'test@example.com' };
      await saveToStorage(STORAGE_KEYS.USER_DATA, testData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(testData)
      );
    });

    it('should handle save errors', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      await expect(
        saveToStorage(STORAGE_KEYS.USER_DATA, { test: 'data' })
      ).rejects.toThrow();
    });
  });

  describe('getFromStorage', () => {
    it('should retrieve and parse data from AsyncStorage', async () => {
      const testData = { name: 'Test User' };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(testData)
      );

      const result = await getFromStorage(STORAGE_KEYS.USER_DATA);
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent keys', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await getFromStorage(STORAGE_KEYS.USER_DATA);
      expect(result).toBeNull();
    });

    it('should handle retrieval errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      const result = await getFromStorage(STORAGE_KEYS.USER_DATA);
      expect(result).toBeNull();
    });
  });

  describe('removeFromStorage', () => {
    it('should remove data from AsyncStorage', async () => {
      await removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.AUTH_TOKEN
      );
    });

    it('should handle removal errors', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      await expect(
        removeFromStorage(STORAGE_KEYS.AUTH_TOKEN)
      ).rejects.toThrow();
    });
  });

  describe('clearAllStorage', () => {
    it('should clear all data from AsyncStorage', async () => {
      await clearAllStorage();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('should handle clear errors', async () => {
      (AsyncStorage.clear as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      await expect(clearAllStorage()).rejects.toThrow();
    });
  });
});

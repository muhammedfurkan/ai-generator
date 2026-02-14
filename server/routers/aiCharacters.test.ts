import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import * as db from "../db";

// Mock database functions
vi.mock("../db", () => ({
  createAiCharacter: vi.fn(),
  getUserAiCharacters: vi.fn(),
  getAiCharacterById: vi.fn(),
  updateAiCharacter: vi.fn(),
  deleteAiCharacter: vi.fn(),
  incrementCharacterUsage: vi.fn(),
  saveAiCharacterImage: vi.fn(),
  getAiCharacterImages: vi.fn(),
  getAllAiCharacterImages: vi.fn(),
  deductCredits: vi.fn(),
  getUserById: vi.fn(),
  // Other required mocks
  getDb: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  saveGeneratedImage: vi.fn(),
  getUserGeneratedImages: vi.fn(),
  getUserGeneratedImagesCount: vi.fn(),
  getAllUsers: vi.fn(),
  getTotalUserCount: vi.fn(),
  deleteUser: vi.fn(),
  updateUserRole: vi.fn(),
  recordCreditTransaction: vi.fn(),
  getCreditTransactions: vi.fn(),
  getDashboardStats: vi.fn(),
  getSystemSetting: vi.fn(),
  updateSystemSetting: vi.fn(),
  addCredits: vi.fn(),
  createUserPromptTemplate: vi.fn(),
  getUserPromptTemplates: vi.fn(),
  deleteUserPromptTemplate: vi.fn(),
  savePromptHistory: vi.fn(),
  getPromptHistory: vi.fn(),
  deletePromptHistory: vi.fn(),
  clearPromptHistory: vi.fn(),
  toggleFavorite: vi.fn(),
  isFavorited: vi.fn(),
  getFavoriteImageIds: vi.fn(),
  getFavoriteImages: vi.fn(),
  toggleCharacterPublic: vi.fn(),
  getPublicCharacters: vi.fn(),
  getPopularCharacters: vi.fn(),
  getPublicCharactersCount: vi.fn(),
}));

// Mock nanoBananaApi
vi.mock("../nanoBananaApi", () => ({
  createGenerationTask: vi.fn(),
  pollTaskCompletion: vi.fn(),
}));

// Mock storage
vi.mock("../storage", () => ({
  storagePut: vi.fn(),
}));

// Mock telegram bot
vi.mock("../telegramBot", () => ({
  notifyCreditSpending: vi.fn().mockResolvedValue(true),
  notifyNewUser: vi.fn().mockResolvedValue(true),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "google",
    role: "user",
    credits: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("AI Characters Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new character", async () => {
      vi.mocked(db.createAiCharacter).mockResolvedValue(1);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.aiCharacters.create({
        name: "Test Character",
        characterImageUrl: "https://example.com/image.jpg",
        description: "A test character",
        gender: "female",
        style: "realistic",
      });

      expect(result).toEqual({ id: 1, success: true });
      expect(db.createAiCharacter).toHaveBeenCalledWith({
        userId: 1,
        name: "Test Character",
        characterImageUrl: "https://example.com/image.jpg",
        description: "A test character",
        gender: "female",
        style: "realistic",
      });
    });

    it("should throw error if character creation fails", async () => {
      vi.mocked(db.createAiCharacter).mockResolvedValue(null);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.aiCharacters.create({
          name: "Test Character",
          characterImageUrl: "https://example.com/image.jpg",
        })
      ).rejects.toThrow("Karakter oluşturulamadı");
    });
  });

  describe("list", () => {
    it("should return user's characters", async () => {
      const mockCharacters = [
        {
          id: 1,
          userId: 1,
          name: "Character 1",
          characterImageUrl: "https://example.com/1.jpg",
          description: null,
          gender: "female",
          style: "realistic",
          usageCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getUserAiCharacters).mockResolvedValue(mockCharacters);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.aiCharacters.list();

      expect(result).toEqual(mockCharacters);
      expect(db.getUserAiCharacters).toHaveBeenCalledWith(1);
    });
  });

  describe("get", () => {
    it("should return a single character", async () => {
      const mockCharacter = {
        id: 1,
        userId: 1,
        name: "Test Character",
        characterImageUrl: "https://example.com/image.jpg",
        description: null,
        gender: "female",
        style: "realistic",
        usageCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getAiCharacterById).mockResolvedValue(mockCharacter);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.aiCharacters.get({ characterId: 1 });

      expect(result).toEqual(mockCharacter);
      expect(db.getAiCharacterById).toHaveBeenCalledWith(1, 1);
    });

    it("should throw error if character not found", async () => {
      vi.mocked(db.getAiCharacterById).mockResolvedValue(null);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.aiCharacters.get({ characterId: 999 })).rejects.toThrow(
        "Karakter bulunamadı"
      );
    });
  });

  describe("update", () => {
    it("should update a character", async () => {
      vi.mocked(db.updateAiCharacter).mockResolvedValue(true);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.aiCharacters.update({
        characterId: 1,
        name: "Updated Name",
        description: "Updated description",
      });

      expect(result).toEqual({ success: true });
      expect(db.updateAiCharacter).toHaveBeenCalledWith(1, 1, {
        name: "Updated Name",
        description: "Updated description",
      });
    });

    it("should throw error if update fails", async () => {
      vi.mocked(db.updateAiCharacter).mockResolvedValue(false);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.aiCharacters.update({
          characterId: 999,
          name: "Updated Name",
        })
      ).rejects.toThrow("Karakter bulunamadı veya güncellenemedi");
    });
  });

  describe("delete", () => {
    it("should delete a character", async () => {
      vi.mocked(db.deleteAiCharacter).mockResolvedValue(true);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.aiCharacters.delete({ characterId: 1 });

      expect(result).toEqual({ success: true });
      expect(db.deleteAiCharacter).toHaveBeenCalledWith(1, 1);
    });

    it("should throw error if delete fails", async () => {
      vi.mocked(db.deleteAiCharacter).mockResolvedValue(false);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.aiCharacters.delete({ characterId: 999 })).rejects.toThrow(
        "Karakter bulunamadı veya silinemedi"
      );
    });
  });

  describe("generateWithCharacter", () => {
    it("should throw error if character not found", async () => {
      vi.mocked(db.getAiCharacterById).mockResolvedValue(null);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.aiCharacters.generateWithCharacter({
          characterId: 999,
          prompt: "Test prompt",
          aspectRatio: "1:1",
          resolution: "1K",
        })
      ).rejects.toThrow("Karakter bulunamadı");
    });

    it("should throw error if user has insufficient credits", async () => {
      const mockCharacter = {
        id: 1,
        userId: 1,
        name: "Test Character",
        characterImageUrl: "https://example.com/image.jpg",
      };

      const mockUser = {
        id: 1,
        credits: 5, // Not enough for 1K (10 credits)
      };

      vi.mocked(db.getAiCharacterById).mockResolvedValue(mockCharacter);
      vi.mocked(db.getUserById).mockResolvedValue(mockUser);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.aiCharacters.generateWithCharacter({
          characterId: 1,
          prompt: "Test prompt",
          aspectRatio: "1:1",
          resolution: "1K",
        })
      ).rejects.toThrow("INSUFFICIENT_CREDITS");
    });
  });

  describe("togglePublic", () => {
    it("should toggle character public status", async () => {
      vi.mocked(db.toggleCharacterPublic).mockResolvedValue({ isPublic: true });

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.aiCharacters.togglePublic({ characterId: 1 });

      expect(result).toEqual({ success: true, isPublic: true });
      expect(db.toggleCharacterPublic).toHaveBeenCalledWith(1, 1);
    });

    it("should throw error if character not found", async () => {
      vi.mocked(db.toggleCharacterPublic).mockResolvedValue(null);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.aiCharacters.togglePublic({ characterId: 999 })).rejects.toThrow(
        "Karakter bulunamadı"
      );
    });
  });

  describe("getPopular", () => {
    it("should return popular public characters", async () => {
      const mockCharacters = [
        {
          id: 1,
          name: "Popular Character",
          characterImageUrl: "https://example.com/1.jpg",
          description: null,
          style: "realistic",
          usageCount: 100,
          userName: "User 1",
        },
      ];

      vi.mocked(db.getPopularCharacters).mockResolvedValue(mockCharacters);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.aiCharacters.getPopular({ limit: 8 });

      expect(result).toEqual(mockCharacters);
      expect(db.getPopularCharacters).toHaveBeenCalledWith(8);
    });
  });

  describe("getPublic", () => {
    it("should return public characters with pagination", async () => {
      const mockCharacters = [
        {
          id: 1,
          name: "Public Character",
          characterImageUrl: "https://example.com/1.jpg",
          description: null,
          gender: "female",
          style: "realistic",
          usageCount: 50,
          createdAt: new Date(),
          userName: "User 1",
        },
      ];

      vi.mocked(db.getPublicCharacters).mockResolvedValue(mockCharacters);
      vi.mocked(db.getPublicCharactersCount).mockResolvedValue(1);

      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.aiCharacters.getPublic({ limit: 50, offset: 0 });

      expect(result).toEqual({ characters: mockCharacters, total: 1 });
      expect(db.getPublicCharacters).toHaveBeenCalledWith(50, 0);
      expect(db.getPublicCharactersCount).toHaveBeenCalled();
    });
  });
});

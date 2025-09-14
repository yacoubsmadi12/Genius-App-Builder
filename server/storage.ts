import { type User, type InsertUser, type AppGeneration, type InsertAppGeneration, type Subscription, type InsertSubscription } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // App Generation methods
  getAppGeneration(id: string): Promise<AppGeneration | undefined>;
  getUserAppGenerations(userId: string): Promise<AppGeneration[]>;
  createAppGeneration(generation: InsertAppGeneration): Promise<AppGeneration>;
  updateAppGeneration(id: string, updates: Partial<AppGeneration>): Promise<AppGeneration | undefined>;

  // Subscription methods
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(userId: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private appGenerations: Map<string, AppGeneration>;
  private subscriptions: Map<string, Subscription>;

  constructor() {
    this.users = new Map();
    this.appGenerations = new Map();
    this.subscriptions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id, 
      createdAt: new Date(),
      photoURL: insertUser.photoURL ?? null,
      provider: insertUser.provider ?? "email",
      firebaseUid: insertUser.firebaseUid ?? null
    };
    this.users.set(id, user);

    // Create default subscription
    await this.createSubscription({
      userId: id,
      plan: "free",
      status: "active",
      generationsUsed: "0",
      generationsLimit: "2"
    });

    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAppGeneration(id: string): Promise<AppGeneration | undefined> {
    return this.appGenerations.get(id);
  }

  async getUserAppGenerations(userId: string): Promise<AppGeneration[]> {
    return Array.from(this.appGenerations.values()).filter(gen => gen.userId === userId);
  }

  async createAppGeneration(insertGeneration: InsertAppGeneration): Promise<AppGeneration> {
    const id = randomUUID();
    const generation: AppGeneration = {
      ...insertGeneration,
      id,
      status: "pending",
      progress: {},
      resultUrl: null,
      apkUrl: null,
      iconUrl: insertGeneration.iconUrl ?? null,
      createdAt: new Date()
    };
    this.appGenerations.set(id, generation);
    return generation;
  }

  async updateAppGeneration(id: string, updates: Partial<AppGeneration>): Promise<AppGeneration | undefined> {
    const generation = this.appGenerations.get(id);
    if (!generation) return undefined;
    
    const updatedGeneration = { ...generation, ...updates };
    this.appGenerations.set(id, updatedGeneration);
    return updatedGeneration;
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(sub => sub.userId === userId);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      status: insertSubscription.status ?? "active",
      generationsUsed: insertSubscription.generationsUsed ?? "0",
      generationsLimit: insertSubscription.generationsLimit ?? "2",
      createdAt: new Date()
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(userId: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = Array.from(this.subscriptions.values()).find(sub => sub.userId === userId);
    if (!subscription) return undefined;
    
    const updatedSubscription = { ...subscription, ...updates };
    this.subscriptions.set(subscription.id, updatedSubscription);
    return updatedSubscription;
  }
}

export const storage = new MemStorage();

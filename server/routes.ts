import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriptionSchema, insertBankConnectionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to get metrics" });
    }
  });

  app.get("/api/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get subscriptions" });
    }
  });

  app.get("/api/subscriptions/:id", async (req, res) => {
    try {
      const subscription = await storage.getSubscription(req.params.id);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to get subscription" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid subscription data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  app.patch("/api/subscriptions/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["active", "unused", "to-cancel"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const subscription = await storage.updateSubscriptionStatus(req.params.id, status);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subscription status" });
    }
  });

  app.patch("/api/subscriptions/:id/usage", async (req, res) => {
    try {
      const { usageCount } = req.body;
      if (typeof usageCount !== "number" || usageCount < 0) {
        return res.status(400).json({ error: "Invalid usage count" });
      }
      const subscription = await storage.updateSubscriptionUsage(req.params.id, usageCount);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to update usage" });
    }
  });

  app.post("/api/subscriptions/:id/log-usage", async (req, res) => {
    try {
      const subscription = await storage.recordSubscriptionUsage(req.params.id);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to record usage" });
    }
  });

  app.delete("/api/subscriptions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSubscription(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subscription" });
    }
  });

  app.get("/api/spending/monthly", async (req, res) => {
    try {
      const monthlySpending = await storage.getMonthlySpending();
      res.json(monthlySpending);
    } catch (error) {
      res.status(500).json({ error: "Failed to get monthly spending" });
    }
  });

  app.get("/api/spending/category", async (req, res) => {
    try {
      const categorySpending = await storage.getSpendingByCategory();
      res.json(categorySpending);
    } catch (error) {
      res.status(500).json({ error: "Failed to get spending by category" });
    }
  });

  app.get("/api/analysis/cost-per-use", async (req, res) => {
    try {
      const analysis = await storage.getCostPerUseAnalysis();
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to get cost per use analysis" });
    }
  });

  app.get("/api/insights/behavioral", async (req, res) => {
    try {
      const insights = await storage.getBehavioralInsights();
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "Failed to get behavioral insights" });
    }
  });

  app.get("/api/insights", async (req, res) => {
    try {
      const insights = await storage.getInsights();
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "Failed to get insights" });
    }
  });

  app.get("/api/recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getRecommendations();
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  app.get("/api/bank-connections", async (req, res) => {
    try {
      const connections = await storage.getBankConnections();
      res.json(connections);
    } catch (error) {
      res.status(500).json({ error: "Failed to get bank connections" });
    }
  });

  app.post("/api/bank-connections", async (req, res) => {
    try {
      const validatedData = insertBankConnectionSchema.parse(req.body);
      const connection = await storage.createBankConnection(validatedData);
      res.status(201).json(connection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid bank connection data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create bank connection" });
    }
  });

  app.patch("/api/bank-connections/:id/sync", async (req, res) => {
    try {
      const connection = await storage.updateBankConnectionSync(req.params.id);
      if (!connection) {
        return res.status(404).json({ error: "Bank connection not found" });
      }
      res.json(connection);
    } catch (error) {
      res.status(500).json({ error: "Failed to sync bank connection" });
    }
  });

  app.delete("/api/bank-connections/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBankConnection(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Bank connection not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bank connection" });
    }
  });

  // Account management endpoints
  app.patch("/api/account/email", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      // In a real app, this would verify the user is authenticated
      // For now, we'll use a mock user ID
      const mockUserId = "default-user-id";
      const updatedUser = await storage.updateUserEmail(mockUserId, email);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true, message: "Email updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update email" });
    }
  });

  app.patch("/api/account/password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Missing password fields" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      // In a real app, this would verify the current password
      const mockUserId = "default-user-id";
      const updatedUser = await storage.updateUserPassword(mockUserId, newPassword);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update password" });
    }
  });

  app.post("/api/account/2fa", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code || code.length !== 6) {
        return res.status(400).json({ error: "Invalid authentication code" });
      }
      // In a real app, this would verify the 2FA code against a time-based OTP
      res.json({ success: true, message: "Two-factor authentication enabled" });
    } catch (error) {
      res.status(500).json({ error: "Failed to enable 2FA" });
    }
  });

  app.get("/api/account/export", async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      const transactions = await storage.getTransactions();
      const insights = await storage.getInsights();
      
      const exportData = {
        exportDate: new Date().toISOString(),
        subscriptions,
        transactions,
        insights,
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=subveris-data.json");
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  app.delete("/api/account", async (req, res) => {
    try {
      // In a real app, this would delete all user data including subscriptions, transactions, etc.
      // For now, just return success
      res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  return httpServer;
}

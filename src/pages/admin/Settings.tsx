/**
 * Data Sync page for managing Pokemon TCG API synchronization
 */

import React from "react";
import { RefreshCw, Database, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { syncPokemonTcg } from "../../services/syncService";

interface SyncProgress {
  stage: "idle" | "fetching-sets" | "syncing-sets" | "fetching-cards" | "syncing-cards" | "complete" | "error";
  message: string;
  setsProgress?: number;
  cardsProgress?: number;
  totalSets?: number;
  totalCards?: number;
  processedSets?: number;
  processedCards?: number;
  currentPage?: number;
  isProcessing?: boolean;
}

/**
 * Data Sync page for Pokemon TCG API synchronization
 */
export const Settings: React.FC = () => {
  const [syncing, setSyncing] = React.useState(false);
  const [lastSync, setLastSync] = React.useState<string | null>(null);
  const [syncError, setSyncError] = React.useState<string | null>(null);
  const [syncResult, setSyncResult] = React.useState<{ setsUpserted: number; cardsUpserted: number } | null>(null);
  const [progress, setProgress] = React.useState<SyncProgress>({
    stage: "idle",
    message: "Ready to update your card inventory",
  });

  const handleSyncNow = async () => {
    try {
      setSyncError(null);
      setSyncResult(null);
      setSyncing(true);
      
      setProgress({
        stage: "fetching-sets",
        message: "Loading card sets...",
        isProcessing: true,
      });

      // Simulate realistic progress updates
      setTimeout(() => {
        setProgress({
          stage: "syncing-sets",
          message: "Saving card sets to your inventory...",
          setsProgress: 50,
          isProcessing: true,
        });
      }, 1000);

      setTimeout(() => {
        setProgress({
          stage: "fetching-cards",
          message: "Loading individual cards... This may take a few minutes.",
          setsProgress: 100,
          currentPage: 1,
          isProcessing: true,
        });
      }, 2000);

      // Simulate card pagination progress
      let currentPage = 1;
      const cardProgressInterval = setInterval(() => {
        if (progress.stage === "syncing-cards" || progress.stage === "fetching-cards") {
          currentPage += 1;
          setProgress(prev => ({
            ...prev,
            stage: "syncing-cards",
            message: `Processing cards... Page ${currentPage} (Please keep this tab open)`,
            currentPage,
            cardsProgress: Math.min((currentPage * 5), 95), // Simulate progress
            isProcessing: true,
          }));
        }
      }, 2000);

      const result = await syncPokemonTcg();
      
      clearInterval(cardProgressInterval);
      setLastSync(new Date().toISOString());
      setSyncResult(result);
      setProgress({
        stage: "complete",
        message: `Update completed! Your inventory now has ${result.setsUpserted} card sets and ${result.cardsUpserted} individual cards.`,
        setsProgress: 100,
        cardsProgress: 100,
        processedSets: result.setsUpserted,
        processedCards: result.cardsUpserted,
        isProcessing: false,
      });
      
      // eslint-disable-next-line no-console
      console.log("Sync complete", result);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setSyncError(message);
      setProgress({
        stage: "error",
        message: `Update failed: ${message}`,
        isProcessing: false,
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStageIcon = (stage: SyncProgress["stage"]) => {
    switch (stage) {
      case "idle": return <Database className="h-5 w-5 text-gray-500" />;
      case "fetching-sets":
      case "syncing-sets":
      case "fetching-cards":
      case "syncing-cards": return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case "complete": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getProgressBarColor = (stage: SyncProgress["stage"]) => {
    switch (stage) {
      case "complete": return "bg-green-500";
      case "error": return "bg-red-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Update Inventory</h2>
          <p className="text-gray-600 mt-1">
            Get the latest Pokemon cards and sets for your inventory.
          </p>
        </div>
        <Button onClick={handleSyncNow} disabled={syncing} size="lg">
          <RefreshCw className={`h-5 w-5 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Updating..." : "Update Now"}
        </Button>
      </div>

      {/* Warning Banner */}
      {syncing && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">Important: Keep This Page Open</h4>
              <p className="text-sm text-amber-700">
                The update process is running. Please do not close this tab or navigate away until it completes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sync Status Card */}
      <Card>
        <div className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center space-x-4">
            {getStageIcon(progress.stage)}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {progress.stage === "idle" && "Ready to Update"}
                {progress.stage === "fetching-sets" && "Loading Card Sets"}
                {progress.stage === "syncing-sets" && "Saving Card Sets"}
                {progress.stage === "fetching-cards" && "Loading Cards"}
                {progress.stage === "syncing-cards" && "Processing Cards"}
                {progress.stage === "complete" && "Update Complete"}
                {progress.stage === "error" && "Update Failed"}
              </h3>
              <p className="text-gray-600">{progress.message}</p>
              {progress.currentPage && (
                <p className="text-sm text-blue-600 mt-1">
                  Currently processing page {progress.currentPage}
                </p>
              )}
            </div>
            <div className="text-right">
              <Badge
                variant={
                  progress.stage === "complete" ? "success" :
                  progress.stage === "error" ? "danger" :
                  syncing ? "info" : "default"
                }
              >
                {progress.stage === "idle" && "Idle"}
                {(progress.stage === "fetching-sets" || progress.stage === "syncing-sets" || 
                  progress.stage === "fetching-cards" || progress.stage === "syncing-cards") && "In Progress"}
                {progress.stage === "complete" && "Success"}
                {progress.stage === "error" && "Failed"}
              </Badge>
            </div>
          </div>

          {/* Progress Bars */}
          {(progress.setsProgress !== undefined || progress.cardsProgress !== undefined) && (
            <div className="space-y-4">
              {progress.setsProgress !== undefined && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Card Sets</span>
                    <span>{Math.round(progress.setsProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(progress.stage)}`}
                      style={{ width: `${progress.setsProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {progress.cardsProgress !== undefined && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Individual Cards {progress.currentPage ? `(Page ${progress.currentPage})` : ""}</span>
                    <span>{Math.round(progress.cardsProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(progress.stage)}`}
                      style={{ width: `${progress.cardsProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {syncError && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Update Failed</h4>
                <p className="text-sm text-red-700 mt-1">{syncError}</p>
              </div>
            </div>
          )}

          {/* Success Results */}
          {syncResult && progress.stage === "complete" && (
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Update Completed Successfully</h4>
                <p className="text-sm text-green-700 mt-1">
                  Added {syncResult.setsUpserted} card sets and {syncResult.cardsUpserted} individual cards to your inventory.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Update History */}
      <Card title="Update History">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Last Update</p>
              <p className="text-xs text-gray-600">{formatLastSync(lastSync)}</p>
            </div>
            <div className="text-right">
              {lastSync ? (
                <Badge variant="success">Complete</Badge>
              ) : (
                <Badge variant="default">No updates yet</Badge>
              )}
            </div>
          </div>

          {syncResult && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{syncResult.setsUpserted}</div>
                <div className="text-sm text-blue-800">Card Sets</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{syncResult.cardsUpserted}</div>
                <div className="text-sm text-green-800">Individual Cards</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

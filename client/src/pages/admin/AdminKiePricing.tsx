// @ts-nocheck
/**
 * Admin Kie.ai Fiyatlandirma - Toplu Maliyet Goruntuleme ve Duzenleme
 * Kie.ai API'den tum model fiyatlarini ceker, toplu olarak goruntuleme ve duzenleme imkani saglar.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  DollarSign,
  Download,
  Edit,
  ExternalLink,
  Filter,
  Image,
  Music,
  RefreshCw,
  Save,
  Search,
  TrendingUp,
  Video,
  MessageSquare,
  Check,
  X,
  ArrowUpDown,
  Percent,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface KieModel {
  modelDescription: string;
  interfaceType: string;
  provider: string;
  creditPrice: string;
  creditUnit: string;
  usdPrice: string;
  falPrice: string;
  discountRate: number;
  anchor: string;
  discountPrice: boolean;
}

export default function AdminKiePricing() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [selectedModels, setSelectedModels] = useState<Set<number>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [markupPercent, setMarkupPercent] = useState(30);
  const [editedPrices, setEditedPrices] = useState<Record<number, number>>({});
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Fetch Kie.ai pricing
  const kieQuery = trpc.adminPanel.fetchKieAiPricing.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  // Fetch our feature pricing
  const pricingQuery = trpc.adminPanel.getFeaturePricing.useQuery();
  const utils = trpc.useUtils();

  const bulkUpdateMutation =
    trpc.adminPanel.bulkUpdateFeaturePricing.useMutation({
      onSuccess: data => {
        toast.success(`${data.updated} fiyat guncellendi`);
        utils.adminPanel.getFeaturePricing.invalidate();
        setBulkEditMode(false);
        setEditedPrices({});
      },
      onError: error => toast.error(error.message),
    });

  const importMutation = trpc.adminPanel.importKieAiModels.useMutation({
    onSuccess: data => {
      toast.success(
        `${data.inserted} model eklendi, ${data.skipped} atlandı (zaten mevcut)`
      );
      utils.adminPanel.getFeaturePricing.invalidate();
      setSelectedModels(new Set());
      setImportDialogOpen(false);
    },
    onError: error => toast.error(error.message),
  });

  const records: KieModel[] = kieQuery.data?.records || [];

  // Filter & search
  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (activeTab !== "all") {
      filtered = filtered.filter(r => r.interfaceType === activeTab);
    }

    if (providerFilter !== "all") {
      filtered = filtered.filter(r => r.provider === providerFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.modelDescription.toLowerCase().includes(q) ||
          r.provider.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [records, activeTab, providerFilter, searchQuery]);

  // Get unique providers
  const providers = useMemo(() => {
    const provSet = new Set(records.map(r => r.provider));
    return Array.from(provSet).sort();
  }, [records]);

  // Stats
  const totalModels = records.length;
  const videoModels = records.filter(r => r.interfaceType === "video").length;
  const imageModels = records.filter(r => r.interfaceType === "image").length;
  const musicModels = records.filter(r => r.interfaceType === "music").length;
  const chatModels = records.filter(r => r.interfaceType === "chat").length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
      case "music":
        return <Music className="h-4 w-4" />;
      case "chat":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-[#FF2E97]/20 text-[#FF2E97] border-[#FF2E97]/30";
      case "image":
        return "bg-[#7C3AED]/20 text-[#7C3AED] border-[#7C3AED]/30";
      case "music":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "chat":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const toggleSelectAll = () => {
    if (selectedModels.size === filteredRecords.length) {
      setSelectedModels(new Set());
    } else {
      setSelectedModels(new Set(filteredRecords.map((_, i) => i)));
    }
  };

  const toggleSelect = (idx: number) => {
    const newSet = new Set(selectedModels);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setSelectedModels(newSet);
  };

  const handleImportSelected = () => {
    const models = filteredRecords.filter((_, i) => selectedModels.has(i));
    if (models.length === 0) {
      toast.error("Lutfen en az bir model secin");
      return;
    }
    importMutation.mutate({ models });
  };

  // Bulk save edited prices
  const handleBulkSave = () => {
    const updates = Object.entries(editedPrices).map(([id, credits]) => ({
      id: parseInt(id),
      credits,
    }));
    if (updates.length === 0) {
      toast.error("Degisiklik yok");
      return;
    }
    bulkUpdateMutation.mutate({ updates });
  };

  // Apply markup to all our pricing
  const applyMarkupToAll = () => {
    if (!pricingQuery.data) return;
    const newPrices: Record<number, number> = {};
    pricingQuery.data.forEach(item => {
      const newCredits = Math.ceil(item.credits * (1 + markupPercent / 100));
      newPrices[item.id] = newCredits;
    });
    setEditedPrices(newPrices);
    toast.success(`%${markupPercent} kar marji uygulandi (kaydedilmedi)`);
  };

  const ourPricing = pricingQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#7C3AED]/20 to-[#FF2E97]/10 rounded-2xl border border-[#7C3AED]/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Toplam Model</p>
              <p className="text-2xl font-bold">{totalModels}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#7C3AED]/20">
              <DollarSign className="h-5 w-5 text-[#7C3AED]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#FF2E97]/20 to-[#FF2E97]/5 rounded-2xl border border-[#FF2E97]/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Video</p>
              <p className="text-2xl font-bold">{videoModels}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FF2E97]/20">
              <Video className="h-5 w-5 text-[#FF2E97]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#7C3AED]/20 to-[#7C3AED]/5 rounded-2xl border border-[#7C3AED]/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Gorsel</p>
              <p className="text-2xl font-bold">{imageModels}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#7C3AED]/20">
              <Image className="h-5 w-5 text-[#7C3AED]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-pink-500/20 to-pink-500/5 rounded-2xl border border-pink-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Muzik</p>
              <p className="text-2xl font-bold">{musicModels}</p>
            </div>
            <div className="p-3 rounded-xl bg-pink-500/20">
              <Music className="h-5 w-5 text-pink-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl border border-green-500/30 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Chat</p>
              <p className="text-2xl font-bold">{chatModels}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/20">
              <MessageSquare className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs: Kie.ai Models + Our Pricing */}
      <Tabs defaultValue="kie" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList className="bg-zinc-800/50">
            <TabsTrigger
              value="kie"
              className="data-[state=active]:bg-[#00F5FF] data-[state=active]:text-black"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Kie.ai Fiyatlar ({totalModels})
            </TabsTrigger>
            <TabsTrigger
              value="our"
              className="data-[state=active]:bg-[#00F5FF] data-[state=active]:text-black"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Bizim Fiyatlar ({ourPricing.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => kieQuery.refetch()}
            >
              <RefreshCw
                className={`h-4 w-4 ${kieQuery.isFetching ? "animate-spin" : ""}`}
              />
              Yenile
            </Button>
          </div>
        </div>

        {/* Kie.ai Models Tab */}
        <TabsContent value="kie" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Type filter */}
            <div className="flex gap-1 bg-zinc-800/50 rounded-lg p-1">
              {[
                { value: "all", label: "Tumu" },
                { value: "video", label: "Video" },
                { value: "image", label: "Gorsel" },
                { value: "music", label: "Muzik" },
                { value: "chat", label: "Chat" },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setActiveTab(t.value)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                    activeTab === t.value
                      ? "bg-[#00F5FF] text-black font-medium"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Provider filter */}
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-[180px] bg-zinc-800 border-white/10">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Provider'lar</SelectItem>
                {providers.map(p => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Model ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-800 border-white/10"
              />
            </div>

            {/* Import button */}
            {selectedModels.size > 0 && (
              <Button
                className="bg-[#00F5FF] hover:bg-[#00F5FF]/90 text-black gap-2"
                onClick={() => setImportDialogOpen(true)}
              >
                <Download className="h-4 w-4" />
                {selectedModels.size} Model Ice Aktar
              </Button>
            )}
          </div>

          {/* Models Table */}
          <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-800/50">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedModels.size === filteredRecords.length &&
                          filteredRecords.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-zinc-600"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                      Tip
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                      Model
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                      Provider
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">
                      Kie Kredi
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">
                      Birim
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">
                      USD
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">
                      FAL
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">
                      Indirim %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRecords.map((model, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-white/5 transition-colors ${
                        selectedModels.has(idx) ? "bg-[#00F5FF]/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedModels.has(idx)}
                          onChange={() => toggleSelect(idx)}
                          className="rounded border-zinc-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getTypeColor(model.interfaceType)}`}
                        >
                          {getTypeIcon(model.interfaceType)}
                          {model.interfaceType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-200 max-w-[400px] truncate">
                            {model.modelDescription}
                          </span>
                          {model.anchor && (
                            <a
                              href={model.anchor}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-500 hover:text-[#00F5FF]"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-zinc-400">
                          {model.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-[#00F5FF]">
                          {model.creditPrice}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-zinc-500">
                          {model.creditUnit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-orange-400">
                          {model.usdPrice ? `$${model.usdPrice}` : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-zinc-400">
                          {model.falPrice ? `$${model.falPrice}` : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {model.discountRate > 0 ? (
                          <span className="text-sm text-green-400">
                            %{model.discountRate.toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-sm text-zinc-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                {kieQuery.isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-[#00F5FF]" />
                    <span className="text-zinc-400">
                      Kie.ai fiyatlari yukleniyor...
                    </span>
                  </div>
                ) : (
                  <p className="text-zinc-500">Sonuc bulunamadi</p>
                )}
              </div>
            )}

            {filteredRecords.length > 0 && (
              <div className="px-4 py-3 bg-zinc-800/30 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm text-zinc-500">
                  {filteredRecords.length} model gosteriliyor
                  {selectedModels.size > 0 &&
                    ` | ${selectedModels.size} secili`}
                </span>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Our Pricing Tab */}
        <TabsContent value="our" className="space-y-4">
          {/* Bulk Actions */}
          <div className="flex items-center gap-3 flex-wrap bg-zinc-900/50 rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={bulkEditMode}
                onCheckedChange={setBulkEditMode}
              />
              <label className="text-sm font-medium">Toplu Duzenleme</label>
            </div>

            {bulkEditMode && (
              <>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-zinc-400" />
                  <Input
                    type="number"
                    value={markupPercent}
                    onChange={e =>
                      setMarkupPercent(parseInt(e.target.value) || 0)
                    }
                    className="w-20 bg-zinc-800 border-white/10 text-center"
                    min={0}
                    max={500}
                  />
                  <span className="text-sm text-zinc-400">% Kar Marji</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={applyMarkupToAll}
                    className="gap-1"
                  >
                    <TrendingUp className="h-3 w-3" />
                    Uygula
                  </Button>
                </div>

                <div className="h-6 w-px bg-white/10" />

                <Button
                  className="bg-[#00F5FF] hover:bg-[#00F5FF]/90 text-black gap-2"
                  onClick={handleBulkSave}
                  disabled={
                    bulkUpdateMutation.isPending ||
                    Object.keys(editedPrices).length === 0
                  }
                >
                  {bulkUpdateMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {Object.keys(editedPrices).length} Degisiklik Kaydet
                </Button>

                {Object.keys(editedPrices).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditedPrices({})}
                    className="text-zinc-400"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Sifirla
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Our Pricing Table */}
          <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-800/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                      Ozellik
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                      Feature Key
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">
                      Mevcut Kredi
                    </th>
                    {bulkEditMode && (
                      <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">
                        Yeni Kredi
                      </th>
                    )}
                    <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                      Aciklama
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ourPricing.map(item => {
                    const isEdited = editedPrices[item.id] !== undefined;
                    const newCredits = editedPrices[item.id] ?? item.credits;
                    const creditDiff = newCredits - item.credits;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-white/5 transition-colors ${isEdited ? "bg-yellow-500/5" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getTypeColor(item.category)}`}
                          >
                            {getTypeIcon(item.category)}
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">
                            {item.featureName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">
                            {item.featureKey}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-lg font-bold text-[#00F5FF]">
                            {item.credits}
                          </span>
                        </td>
                        {bulkEditMode && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                type="number"
                                value={newCredits}
                                onChange={e => {
                                  const val = parseInt(e.target.value) || 0;
                                  setEditedPrices(prev => ({
                                    ...prev,
                                    [item.id]: val,
                                  }));
                                }}
                                className="w-24 bg-zinc-800 border-white/10 text-right"
                                min={0}
                              />
                              {isEdited && (
                                <span
                                  className={`text-xs font-medium ${creditDiff > 0 ? "text-green-400" : creditDiff < 0 ? "text-red-400" : "text-zinc-500"}`}
                                >
                                  {creditDiff > 0 ? "+" : ""}
                                  {creditDiff}
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3 text-center">
                          {item.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-400 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-zinc-500 max-w-[300px] truncate block">
                            {item.description || "-"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {ourPricing.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-500">
                  Henuz fiyatlandirma tanimlanmamis
                </p>
                <p className="text-xs text-zinc-600 mt-2">
                  Kie.ai sekmesinden modelleri ice aktarabilirsiniz
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Import Confirmation Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-[#00F5FF]" />
              Modelleri Ice Aktar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-zinc-400">
              Secilen{" "}
              <span className="font-bold text-white">
                {selectedModels.size}
              </span>{" "}
              model fiyatlandirma tablosuna eklenecek. Zaten mevcut olanlar
              atlanacak.
            </p>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredRecords
                .filter((_, i) => selectedModels.has(i))
                .map((model, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 bg-zinc-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs ${getTypeColor(model.interfaceType)}`}
                      >
                        {model.interfaceType}
                      </span>
                      <span className="text-sm truncate max-w-[250px]">
                        {model.modelDescription}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#00F5FF]">
                        {model.creditPrice}
                      </span>
                      <span className="text-xs text-zinc-500">kredi</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setImportDialogOpen(false)}
              >
                Iptal
              </Button>
              <Button
                className="flex-1 bg-[#00F5FF] hover:bg-[#00F5FF]/90 text-black gap-2"
                onClick={handleImportSelected}
                disabled={importMutation.isPending}
              >
                {importMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Ice Aktar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

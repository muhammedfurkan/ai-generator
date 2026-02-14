import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PROMPT_TEMPLATES, TEMPLATE_CATEGORIES } from "@shared/const";
import { Sparkles, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PromptTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: any) => void;
}

export default function PromptTemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
}: PromptTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");

  const userTemplatesQuery = trpc.userTemplates.list.useQuery(undefined, {
    enabled: isOpen,
  });

  const utils = trpc.useUtils();
  const deleteTemplateMutation = trpc.userTemplates.delete.useMutation({
    onSuccess: () => {
      toast.success("Şablon silindi");
      utils.userTemplates.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Şablon silinemedi");
    },
  });

  const allCategories = ["Tümü", "Kendi Şablonlarım", ...TEMPLATE_CATEGORIES];

  const userTemplates = userTemplatesQuery.data || [];
  const systemTemplates = PROMPT_TEMPLATES;

  const filteredTemplates =
    selectedCategory === "Tümü"
      ? [...userTemplates.map(t => ({ ...t, isUserTemplate: true })), ...systemTemplates.map(t => ({ ...t, isUserTemplate: false }))]
      : selectedCategory === "Kendi Şablonlarım"
      ? userTemplates.map(t => ({ ...t, isUserTemplate: true }))
      : systemTemplates.filter(t => t.category === selectedCategory).map(t => ({ ...t, isUserTemplate: false }));

  const handleSelectTemplate = (template: any) => {
    onSelectTemplate({
      prompt: template.prompt,
      aspectRatio: template.aspectRatio,
      resolution: template.resolution,
      title: template.title,
    });
    onClose();
  };

  const handleDeleteTemplate = (e: React.MouseEvent, templateId: number) => {
    e.stopPropagation();
    if (confirm("Bu şablonu silmek istediğinizden emin misiniz?")) {
      deleteTemplateMutation.mutate({ templateId });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Prompt Şablonları
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Hazır şablonlardan birini seçin veya kendi şablonlarınızı kullanın
          </p>
        </DialogHeader>

        {/* Category Filters - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {allCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="shrink-0"
            >
              {category}
              {category === "Kendi Şablonlarım" && userTemplates.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-primary/20">
                  {userTemplates.length}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Templates Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-2">
          {userTemplatesQuery.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-muted-foreground">
                  {selectedCategory === "Kendi Şablonlarım"
                    ? "Henüz kaydettiğiniz şablon yok. Görsel oluşturduktan sonra 'Şablon Olarak Kaydet' butonunu kullanabilirsiniz."
                    : "Bu kategoride şablon bulunamadı"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template: any) => (
                <button
                  key={template.id || template.title}
                  onClick={() => handleSelectTemplate(template)}
                  className="glass-card p-4 text-left hover:bg-accent transition-all group relative"
                >
                  {/* Header: Category & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      template.isUserTemplate
                        ? "bg-green-500/20 text-green-400"
                        : "bg-primary/20 text-primary"
                    }`}>
                      {template.isUserTemplate ? "Kendi" : template.category}
                    </span>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {template.isUserTemplate && (
                        <button
                          onClick={(e) => handleDeleteTemplate(e, template.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20"
                          disabled={deleteTemplateMutation.isPending}
                          title="Sil"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      )}
                      <span className="shrink-0">{template.aspectRatio}</span>
                      <span className="shrink-0">{template.resolution}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                    {template.title}
                  </h3>

                  {/* Description */}
                  {template.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {template.description}
                    </p>
                  )}

                  {/* Prompt Preview */}
                  <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground line-clamp-3">
                    {template.prompt}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t text-center">
          <p className="text-xs text-muted-foreground">
            {filteredTemplates.length} şablon gösteriliyor
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

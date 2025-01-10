import { useState, useRef } from 'react';
import { Upload, Download, Plus, Trash2, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface TableData {
  id: string;
  empresa: string;
  valor: string;
  vencimento: string;
}

interface VariablePosition {
  id: string;
  x: number;
  y: number;
  value: string;
}

export default function ContasSemanais() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backgroundSvg, setBackgroundSvg] = useState<string | null>(null);
  const [showPositionConfig, setShowPositionConfig] = useState(false);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [variablePositions, setVariablePositions] = useState<VariablePosition[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/svg+xml') {
        toast({
          title: "Erro no upload",
          description: "Por favor, selecione um arquivo SVG válido.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundSvg(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTableRow = () => {
    const newRow: TableData = {
      id: crypto.randomUUID(),
      empresa: '',
      valor: '',
      vencimento: '',
    };
    setTableData([...tableData, newRow]);
  };

  const removeTableRow = (id: string) => {
    setTableData(tableData.filter(row => row.id !== id));
  };

  const updateTableRow = (id: string, field: keyof TableData, value: string) => {
    setTableData(tableData.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleConfigurePositions = () => {
    setShowPositionConfig(true);
  };

  const generatePDF = () => {
    // TODO: Implement PDF generation
    toast({
      title: "Gerando PDF",
      description: "Função em desenvolvimento...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Background Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Plano de Fundo</CardTitle>
          <CardDescription>
            Faça upload de uma imagem SVG para usar como plano de fundo do relatório
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".svg"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload SVG
            </Button>
            {backgroundSvg && (
              <span className="text-sm text-muted-foreground">
                SVG carregado com sucesso
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dados do Relatório</CardTitle>
              <CardDescription>
                Preencha os dados que serão exibidos no relatório
              </CardDescription>
            </div>
            <Button onClick={addTableRow}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Linha
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Input
                      value={row.empresa}
                      onChange={(e) => updateTableRow(row.id, 'empresa', e.target.value)}
                      placeholder="Nome da empresa"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.valor}
                      onChange={(e) => updateTableRow(row.id, 'valor', e.target.value)}
                      placeholder="R$ 0,00"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={row.vencimento}
                      onChange={(e) => updateTableRow(row.id, 'vencimento', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTableRow(row.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tableData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum dado adicionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={handleConfigurePositions}
          disabled={!backgroundSvg || tableData.length === 0}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurar Posições
        </Button>
        <Button
          onClick={generatePDF}
          disabled={!backgroundSvg || tableData.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Gerar PDF
        </Button>
      </div>

      {/* Position Configuration Dialog */}
      <Dialog open={showPositionConfig} onOpenChange={setShowPositionConfig}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Configurar Posições das Variáveis</DialogTitle>
          </DialogHeader>
          <div className="relative min-h-[500px] border rounded-lg">
            {backgroundSvg && (
              <div 
                className="absolute inset-0 bg-contain bg-no-repeat bg-center"
                style={{ backgroundImage: `url(${backgroundSvg})` }}
              />
            )}
            {/* Here we'll add the drag-and-drop functionality for positioning variables */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPositionConfig(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowPositionConfig(false)}>
              Salvar Posições
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
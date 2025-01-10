import { useState, useRef } from 'react';
import { Upload, Download, Plus, Trash2, Settings, Eye } from 'lucide-react';
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
import Draggable from 'react-draggable';
import jsPDF from 'jspdf';

interface CompanyData {
  name: string;
  cnpj: string;
  address: string;
}

interface TotalData {
  totalReceivable: string;
  totalPayable: string;
  balance: string;
}

interface AccountEntry {
  date: string;
  description: string;
  value: string;
  status: string;
}

interface AccountData {
  payable: AccountEntry[];
  receivable: AccountEntry[];
}

interface VariablePosition {
  id: string;
  label: string;
  x: number;
  y: number;
}

export default function ContasSemanais() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backgroundSvg, setBackgroundSvg] = useState<string | null>(null);
  const [showPositionConfig, setShowPositionConfig] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Data state
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    cnpj: '',
    address: ''
  });
  
  const [totalData, setTotalData] = useState<TotalData>({
    totalReceivable: '',
    totalPayable: '',
    balance: ''
  });
  
  const [accountData, setAccountData] = useState<AccountData>({
    payable: Array(5).fill({ date: '', description: '', value: '', status: '' }),
    receivable: Array(5).fill({ date: '', description: '', value: '', status: '' })
  });

  // Variable positions state
  const [variablePositions, setVariablePositions] = useState<VariablePosition[]>([
    { id: 'company-name', label: 'Nome da Empresa', x: 0, y: 0 },
    { id: 'cnpj', label: 'CNPJ', x: 0, y: 50 },
    { id: 'address', label: 'Endereço', x: 0, y: 100 },
    { id: 'total-receivable', label: 'Total a Receber', x: 0, y: 150 },
    { id: 'total-payable', label: 'Total a Pagar', x: 0, y: 200 },
    { id: 'balance', label: 'Saldo', x: 0, y: 250 },
  ]);

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
        toast({
          title: "SVG carregado",
          description: "O arquivo SVG foi carregado com sucesso.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStop = (id: string, e: any, data: { x: number; y: number }) => {
    setVariablePositions(prev => prev.map(pos => 
      pos.id === id ? { ...pos, x: data.x, y: data.y } : pos
    ));
  };

  const generatePDF = () => {
    try {
      // Create new PDF document with A4 dimensions (2480x3508 px at 300 DPI)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [2480, 3508]
      });

      // Add background if exists
      if (backgroundSvg) {
        pdf.addImage(backgroundSvg, 'SVG', 0, 0, 2480, 3508);
      }

      // Add variables in their positions
      variablePositions.forEach(variable => {
        let value = '';
        switch (variable.id) {
          case 'company-name':
            value = companyData.name;
            break;
          case 'cnpj':
            value = companyData.cnpj;
            break;
          case 'address':
            value = companyData.address;
            break;
          case 'total-receivable':
            value = totalData.totalReceivable;
            break;
          case 'total-payable':
            value = totalData.totalPayable;
            break;
          case 'balance':
            value = totalData.balance;
            break;
        }
        pdf.text(value, variable.x, variable.y);
      });

      // Save the PDF
      pdf.save('relatorio-semanal.pdf');

      toast({
        title: "PDF Gerado",
        description: "O relatório foi gerado e baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Background Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Plano de Fundo</CardTitle>
          <CardDescription>
            Faça upload de uma imagem SVG para usar como plano de fundo do relatório (2480x3508 px)
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  SVG carregado com sucesso
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rest of the components remain the same until the dialogs */}

      {/* Position Configuration Dialog with improved usability */}
      <Dialog open={showPositionConfig} onOpenChange={setShowPositionConfig}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>Configurar Posições das Variáveis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {variablePositions.map((variable) => (
                <div key={variable.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium">{variable.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">X</Label>
                      <Input
                        type="number"
                        value={variable.x}
                        onChange={(e) => {
                          const x = parseInt(e.target.value);
                          setVariablePositions(prev => prev.map(pos =>
                            pos.id === variable.id ? { ...pos, x } : pos
                          ));
                        }}
                        className="w-24"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Y</Label>
                      <Input
                        type="number"
                        value={variable.y}
                        onChange={(e) => {
                          const y = parseInt(e.target.value);
                          setVariablePositions(prev => prev.map(pos =>
                            pos.id === variable.id ? { ...pos, y } : pos
                          ));
                        }}
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div 
                className="w-[2480px] h-[3508px] origin-top-left relative"
                style={{ 
                  transform: 'scale(0.2)',
                  backgroundImage: backgroundSvg ? `url(${backgroundSvg})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {variablePositions.map((variable) => (
                  <Draggable
                    key={variable.id}
                    position={{ x: variable.x, y: variable.y }}
                    onStop={(e, data) => handleDragStop(variable.id, e, data)}
                    bounds="parent"
                  >
                    <div className="absolute cursor-move bg-white dark:bg-gray-800 p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">{variable.label}</span>
                    </div>
                  </Draggable>
                ))}
              </div>
            </div>
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

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>Visualização do SVG</DialogTitle>
          </DialogHeader>
          <div className="w-full overflow-auto max-h-[80vh]">
            {backgroundSvg && (
              <img
                src={backgroundSvg}
                alt="Preview do SVG"
                className="w-full h-auto"
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Display SVG at the bottom if loaded */}
      {backgroundSvg && (
        <Card>
          <CardHeader>
            <CardTitle>SVG Carregado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden rounded-lg border">
              <img
                src={backgroundSvg}
                alt="SVG carregado"
                className="w-full h-auto"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
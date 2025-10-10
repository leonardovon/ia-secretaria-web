import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { Stethoscope, ArrowLeft } from 'lucide-react';

const signUpSchema = z.object({
  nome_clinica: z.string().trim().min(3, 'Seu nome deve ter pelo menos 3 caracteres'),
  telefone: z.string().trim().min(10, 'Telefone inválido').max(15, 'Telefone inválido'),
  endereco: z.string().trim(),
  email: z.string().trim().email('E-mail inválido'),
  login: z.string().trim().min(3, 'Login deve ter pelo menos 3 caracteres'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmar_senha: z.string().min(1, 'Confirme sua senha'),
}).refine((data) => data.senha === data.confirmar_senha, {
  message: 'As senhas não coincidem',
  path: ['confirmar_senha'],
});

export default function SignUp() {
  const [formData, setFormData] = useState({
    nome_clinica: '',
    telefone: '',
    endereco: '',
    email: '',
    login: '',
    senha: '',
    confirmar_senha: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/demo');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'login' 
      ? e.target.value.toLowerCase() 
      : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = {
        ...signUpSchema.parse(formData),
        login: formData.login.toLowerCase()
      };
      setIsLoading(true);

      // 1. Criar configuração da clínica
      const { data: configData, error: configError } = await supabase.rpc('update_clinica_config', {
        p_nome_clinica: validatedData.nome_clinica,
        p_telefone: validatedData.telefone,
        p_endereco: validatedData.endereco || null,
        p_login: validatedData.login,
        p_senha_hash: validatedData.senha,
      });

      if (configError || !configData || configData.length === 0) {
        console.error('Erro ao criar configuração:', configError);
        toast({
          title: 'Erro ao criar conta',
          description: 'Não foi possível criar a configuração da clínica.',
          variant: 'destructive',
        });
        return;
      }

      const clinicId = configData[0].id;

      // 2. Criar conta de usuário
      const { data: userId, error: userError } = await supabase.rpc(
        'create_user_account' as any,
        {
          p_clinic_id: clinicId,
          p_username: validatedData.login,
          p_password_hash: validatedData.senha,
          p_full_name: validatedData.nome_clinica,
          p_role: 'admin'
        }
      );

      if (userError) {
        console.error('Erro ao criar usuário:', userError);
        toast({
          title: 'Erro ao criar conta',
          description: 'Não foi possível criar a conta de usuário.',
          variant: 'destructive',
        });
        return;
      }

      // TODO: Implementar envio de email de boas-vindas após deploy
      // const loginUrl = `${window.location.origin}/login`;
      // await supabase.functions.invoke('send-welcome-email', {
      //   body: {
      //     name: validatedData.nome_clinica,
      //     email: validatedData.email,
      //     login: validatedData.login,
      //     password: validatedData.senha,
      //     loginUrl: loginUrl
      //   }
      // });

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você já pode fazer login no sistema.',
      });
      
      navigate('/login');
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Erro de validação',
          description: err.errors[0].message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-4">
          <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para login
          </Link>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl mt-4">Criar Nova Conta</CardTitle>
            <CardDescription className="text-base mt-2">
              Cadastre sua clínica para começar a usar o sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_clinica">Seu nome *</Label>
              <Input
                id="nome_clinica"
                name="nome_clinica"
                type="text"
                value={formData.nome_clinica}
                onChange={handleChange}
                placeholder="Digite seu nome"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contato@clinica.com"
                  disabled={isLoading}
                />
              </div>
            </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Cidade e UF</Label>
                <Textarea
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Ex.: Curitiba - PR"
                  disabled={isLoading}
                  rows={2}
                />
              </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">Dados de Acesso</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Login/Usuário *</Label>
                  <Input
                    id="login"
                    name="login"
                    type="text"
                    value={formData.login}
                    onChange={handleChange}
                    placeholder="Digite seu usuário"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha *</Label>
                    <Input
                      id="senha"
                      name="senha"
                      type="password"
                      value={formData.senha}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmar_senha">Confirmar Senha *</Label>
                    <Input
                      id="confirmar_senha"
                      name="confirmar_senha"
                      type="password"
                      value={formData.confirmar_senha}
                      onChange={handleChange}
                      placeholder="Digite a senha novamente"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

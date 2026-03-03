---
name: project-pro
description: Regras e padrões para o projeto Frontend Angular Clinipet + Supabase.
---

# Project Pro: Padrões Clinipet

Esta skill impõe os padrões arquiteturais e de código específicos para o projeto Clinipet.

## 1. Arquitetura e Estrutura de Arquivos

Este projeto segue uma arquitetura baseada em funcionalidades (features) com Standalone Components.

- **`core/`**: Serviços, Modelos, Interceptores, Guards (Instâncias Singleton).
- **`features/`**: Módulos específicos de domínio (ex: `pets`, `owners`, `appointments`).
  - Cada funcionalidade tem sua própria pasta.
  - Componentes são Standalone (`standalone: true`).
- **`shared/`**: Componentes de UI reutilizáveis, pipes, diretivas.

## 2. Regras de Frontend (Angular)

### Injeção de Dependência
- Use a função `inject()` em vez de injeção via construtor para melhor legibilidade e inferência de tipos.
  ```typescript
  // ✅ Correto
  private petService = inject(PetService);

  // ❌ Evitar
  constructor(private petService: PetService) {}
  ```

### Componentes
- **Standalone**: Todos os novos componentes devem ser standalone.
- **Importações**: Importe apenas o que você precisa (ex: `MatButtonModule`, `CommonModule`).
- **Detecção de Mudanças**: Embora `ChangeDetectorRef` seja usado, prefira `AsyncPipe` onde possível nos templates para evitar gerenciamento manual de subscrições.

### UI & Estilização
- **Angular Material**: Use componentes Material para todos os elementos interativos (Botões, Inputs, Diálogos, Tabelas).
- **Tailwind CSS**: Use classes utilitárias do Tailwind para layout, espaçamento e cores.
  - Exemplo: `<div class="p-4 flex flex-col gap-4">`.
- **Ícones**: Use `MatIcon`.

### Formulários
- Use Reactive Forms (`FormBuilder`, `FormGroup`).
- Validação: Implemente validadores na definição do formulário.

## 3. Dados e Backend (Supabase)

### Padrão de Camada de Serviço
- **NÃO** chame o cliente Supabase diretamente nos componentes.
- Sempre crie um Serviço (ex: `PetService`) que encapsule a lógica.

### Cliente Supabase
- Use `SupabaseService` (injetável na raiz) para acessar o cliente.
  ```typescript
  private supabase = inject(SupabaseService);
  ```

### Observables
- Envolva as promises do Supabase em `from()` para retornar Observables.
- Use `.pipe(map(...))` para transformar dados e tratar erros.
  ```typescript
  getPets(): Observable<Pet[]> {
      return from(this.supabase.from('pets').select('*')).pipe(
          map(response => {
              if (response.error) throw response.error;
              return response.data;
          })
      );
  }
  ```

### Segurança de Tipos
- Defina interfaces em `core/models/`.
- Faça o cast manual das respostas do Supabase para suas interfaces.
  ```typescript
  return data as Pet[];
  ```

## 4. Fluxo de Trabalho Geral

- **Nomenclatura**: Use `kebab-case` para arquivos (`pet-list.component.ts`), `PascalCase` para classes (`PetListComponent`), e `camelCase` para propriedades/métodos.
- **Git**: Mensagens de commit devem ser descritivas (ex: `feat: add pet list component`, `fix: resolve supabase connection error`).

## 5. Padrões de Código

- **Linting**: Siga a configuração ESLint/Prettier do projeto.
- **Modo Estrito**: O modo estrito do TypeScript está ativado. Trate `null` e `undefined` explicitamente.
- Sempre user os principiso de S.O.L.I.D 

## 6. Padrões de Arquitetura

- **Arquitetura**: Use a arquitetura baseada em funcionalidades (features) com Standalone Components.
- **Camadas**: Use a camada de serviço para encapsular a lógica de negócios.
- **Interceptores**: Use interceptores para interceptar requisições e respostas.
- **Guards**: Use guards para proteger rotas.


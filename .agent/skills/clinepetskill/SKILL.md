---
name: clinepetskill
description: Skill de Frontend especialista para o projeto Clinipet.
---

# Clinepet Skill: Padrões de Frontend

Esta skill define os padrões e melhores práticas para o desenvolvimento frontend do Clinipet usando Angular e Supabase.

## 1. Arquitetura do Projeto

O projeto segue uma arquitetura baseada em funcionalidades (features) com Standalone Components.

- **`core/`**: Serviços globais, modelos, interceptores e guards.
- **`features/`**: Módulos de domínio (ex: `pets`, `owners`, `appointments`).
  - Cada pasta contém seus componentes, serviços locais e interfaces.
  - Componentes são **Standalone**.
- **`shared/`**: Componentes reutilizáveis de UI, pipes e diretivas.

## 2. Regras Angular

### Componentes Modernos
- **Standalone**: Use `standalone: true` em todos os componentes.
- **Injeção de Dependência**: Use a função `inject()` em vez de construtores.
  ```typescript
  private service = inject(MyService);
  ```
- **Inputs/Outputs**: Use `input()` e `output()` signals quando possível (Angular 17+).

### Gerenciamento de Estado e Reatividade
- **AsyncPipe**: Prefira usar `| async` no template para evitar vazamento de memória com subscrições manuais.
- **Signals**: Adote Signals para estado local reativo.

## 3. UI e Estilização

### Sistema de Design Híbrido
- **Angular Material**: Use para componentes interativos (Botões, Inputs, Dialogs, Tabelas).
- **Tailwind CSS**: Use para layout, espaçamento, tipografia e cores customizadas.
  - Exemplo: `<div class="flex flex-col gap-4 p-4">`.
- **Ícones**: Sempre use `MatIcon`.

### Responsividade
- Use breakpoints do Tailwind (`sm:`, `md:`, `lg:`, `xl:`) para garantir layouts fluidos.
- Teste em diferentes níveis de zoom.

## 4. Integração com Supabase

### Serviços de Dados
- **Nunca** chame o Supabase diretamente nos componentes. Crie serviços dedicados.
- Use `from()` para converter Promises do Supabase em Observables.
- Tipagem forte: Sempre faça cast das respostas para interfaces definidas em `core/models/`.

```typescript
getOwners(): Observable<Owner[]> {
  return from(this.supabase.from('owners').select('*')).pipe(
    map(res => res.data as Owner[])
  );
}
```

## 5. Convenções de Código

- **Nomenclatura**:
  - Arquivos: `kebab-case` (ex: `owner-list.component.ts`)
  - Classes: `PascalCase` (ex: `OwnerListComponent`)
  - Variáveis/Métodos: `camelCase`
- **Commits**: Use mensagens descritivas seguindo Conventional Commits (ex: `feat: add owner search`).
- **Linting**: Respeite as regras do ESLint/Prettier configuradas.
- **S.O.L.I.D**: Sempre use os principios de S.O.L.I.D
- **otimizacao**: Sempre use as melhores praticas de otimizacao do angular
- **Documentacao**: Remova comentarios desnecessarios e mantenha o codigo limpo

## 6. Manuel de Ajuda

- **Atualize**: Sempre revise e atualize o manaual do usuario quando exemplo o dashboard e não esquecer de colocar o icone correto da pagina que o mesmo usado no frontend na aba da pagina

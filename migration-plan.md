# Plano de Migração para Angular Material (Híbrido)

## Objetivo
Modernizar a interface do Clinipet utilizando **Angular Material** para componentes de UI, mantendo **Tailwind CSS** para layout e utilitários de posicionamento.

## Estratégia
- **Modelo Híbrido**: 
  - **Angular Material**: Responsável pela "micro-estrutura" (Botões, Cards, Inputs, Dialogs, Menus).
  - **Tailwind CSS**: Responsável pela "macro-estrutura" (Grid, Flexbox, Margins, Paddings, Colors de fundo customizadas).
- **Migração Progressiva**: Conversão tela a tela, começando pela Home.

## Configuração Atual
- Tema: `deeppurple-amber` (prebuilt).
- Tailwind: Configurado e ativo.
- Ícones: Material Icons (Verificado no index.html).

## Roteiro de Migração

### Fase 1: Home (Start)
- [ ] Converter Cards de resumo para `MatCard`.
- [ ] Converter Ações Rápidas para `MatButton` (raised e stroked).
- [ ] Utilizar `MatIcon` para ícones.

### Fase 2: Lists (Owners, Doctors, Pets)
- [ ] Substituir tabelas manuais por `MatTable` (com Sort e Paginator).
- [ ] Substituir inputs de filtro por `MatFormField` + `MatInput`.

### Fase 3: Forms (Forms de Criação/Edição)
- [ ] Converter todos os inputs para `MatInput` dentro de `MatFormField`.
- [ ] Converter selects para `MatSelect`.
- [ ] Adicionar `MatDatepicker` para campos de data.
- [ ] Padronizar botões de ação (Salvar/Cancelar) com Material Buttons.

### Fase 4: Feedback e Navegação
- [ ] Implementar `MatSnackBar` para notificações (hoje via alert/console?).
- [ ] (Opcional) Migrar Sidebar/Toolbar para `MatSidenav` e `MatToolbar`.

## Padrões de Código
### Componentes
```typescript
// Imports necessários nos componentes Standalone
imports: [
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  // ...
]
```

### HTML Template
```html
<!-- ANTES (Tailwind Puro) -->
<button class="bg-blue-500 text-white px-4 py-2 rounded">Salvar</button>

<!-- DEPOIS (Híbrido) -->
<button mat-raised-button color="primary">Salvar</button>
```

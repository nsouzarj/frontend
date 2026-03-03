# Clinipet

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.1.

## Arquitetura do Projeto

O projeto Clinipet segue uma arquitetura baseada em funcionalidades (Feature-based Architecture) com Angular Standalone Components, utilizando o Supabase como Backend as a Service (BaaS).

```mermaid
graph TD
    User([Usuário]) --> App[Aplicação Angular]
    
    subgraph App [Frontend Angular]
        direction TB
        
        subgraph Features [Features - Módulos de Domínio]
            Pets[Pets]
            Owners[Owners]
            Appointments[Appointments]
            AuthFeature[Auth]
        end
        
        subgraph Shared [Shared - UI e Utilitários]
            UIComponents[Componentes UI - Material/Tailwind]
            Pipes[Pipes]
            Directives[Directives]
        end
        
        subgraph Core [Core - Serviços Singleton]
            Services[Serviços de Negócio]
            Models[Interfaces/Tipos]
            Interceptors[HTTP Interceptors]
            Guards[Route Guards]
            SupabaseClient[SupabaseService]
        end
        
        Features --> Shared
        Features --> Core
        Shared --> Core
    end
    
    Services --> SupabaseClient
    Guards -.-> AuthFeature
    
    subgraph Backend [Backend Rest Supabase]
        direction LR
        DB[(Banco de Dados PostgreSQL)]
        Auth[Autenticação]
        Storage[Arquivos/Storage]
    end
    
    SupabaseClient --> DB
    SupabaseClient --> Auth
    SupabaseClient --> Storage
```

### Estrutura de Diretórios

- **`core/`**: Arquivos essenciais e instâncias Singleton, como Serviços (incluindo a integração via `SupabaseService`), Modelos de dados (Interfaces), Interceptores HTTP e Guards de roteamento.
- **`features/`**: Módulos e páginas específicas do domínio do negócio (por exemplo: gerenciar pets, tutores, agendamentos). Cada funcionalidade é isolada e utiliza a diretriz `standalone: true`.
- **`shared/`**: Reúne artefatos reaproveitáveis de UI que não possuem lógica de negócio estrita, baseados em Angular Material e Tailwind CSS, além de pipes e diretivas amplamente usados.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

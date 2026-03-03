# Diagrama de Classes do App Clinipet

Este documento apresenta o diagrama de classes das principais entidades do sistema Clinipet, baseado nos modelos do frontend.

```mermaid
classDiagram
    %% Entities
    class User {
        +number|string id
        +string email
        +string full_name
        +boolean is_active
        +string role
    }

    class Owner {
        +number id
        +string full_name
        +string email
        +string phone
        +string address
    }

    class Pet {
        +number id
        +string name
        +SpeciesType species
        +string breed
        +number age_years
        +number weight_kg
        +string size
        +number owner_id
    }

    class Breed {
        +number id
        +string name
        +SpeciesType species
    }

    class Doctor {
        +number id
        +string full_name
        +string crmv
        +string specialty
        +string phone
        +string email
        +boolean is_active
    }

    class Appointment {
        +number id
        +number doctor_id
        +number pet_id
        +string date_time
        +AppointmentStatus status
        +string reason
        +string notes
        +number service_id
        +number price
    }

    class Service {
        +number id
        +string name
        +string description
        +number duration_minutes
        +boolean is_active
    }

    class ServicePrice {
        +number id
        +number service_id
        +string species
        +string size
        +number price
    }

    %% Enumerations
    class SpeciesType {
        <<enumeration>>
        DOG
        CAT
        BIRD
        OTHER
    }

    class AppointmentStatus {
        <<enumeration>>
        SCHEDULED
        COMPLETED
        CANCELLED
    }

    %% Relationships
    Owner "1" -- "*" Pet : possui
    Pet "*" -- "1" Owner : pertence a
    Pet .. Breed : tem raça (nome/ref)
    
    Appointment "*" -- "1" Doctor : realizado por
    Appointment "*" -- "1" Pet : para
    Appointment "*" -- "0..1" Service : inclui
    
    Service "1" -- "*" ServicePrice : tem preços
```

## Descrição das Entidades

- **User**: Representa os usuários do sistema (administradores, médicos, funcionários) com acesso autenticado.
- **Owner**: Representa os tutores dos pets, contendo informações de contato e endereço.
- **Pet**: Representa os animais atendidos, vinculados a um tutor (Owner).
- **Breed**: Lista de raças disponíveis para cadastro, separadas por espécie.
- **Doctor**: Médicos veterinários que realizam os atendimentos (consultas).
- **Appointment**: Agendamento de consultas ou serviços, vinculando um Pet a um Doctor e opcionalmente a um Serviço.
- **Service**: Catálogo de serviços oferecidos pela clínica (ex: Consulta, Vacina, Banho).
- **ServicePrice**: Tabela de preços dos serviços, podendo variar por espécie e porte do animal.

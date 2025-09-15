# Implementação de Princípios SOLID e Padrões de Projeto no Fórum Acadêmico

## 📋 Sumário
- [Princípios SOLID](#princípios-solid)
  - [SRP - Single Responsibility Principle](#srp---single-responsibility-principle)
  - [DIP - Dependency Inversion Principle](#dip---dependency-inversion-principle)
  - [OCP - Open/Closed Principle](#ocp---openclosed-principle)
- [Padrões de Projeto](#padrões-de-projeto)
  - [Factory Pattern](#factory-pattern)
  - [Singleton Pattern](#singleton-pattern)

---

## Princípios SOLID

### SRP - Single Responsibility Principle

**Definição:** Cada classe deve ter apenas uma razão para mudar, ou seja, uma única responsabilidade.

#### Implementação no Projeto

**1. Services com Responsabilidades Específicas**

Cada service tem uma responsabilidade bem definida:

```typescript
// src/services/user.service.ts
export class UserService {
  // Responsabilidade: Gerenciar usuários (CRUD, autenticação)
  static async create(userData: CreateUserData): Promise<User> { ... }
  static async findByUsername(username: string): Promise<User | null> { ... }
  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> { ... }
  static async login(loginData: LoginData): Promise<User | null> { ... }
}
```

```typescript
// src/services/post.service.ts
export class PostService {
  // Responsabilidade: Gerenciar posts (CRUD, estatísticas)
  static async create(postData: CreatePostData): Promise<Post> { ... }
  static async findById(id: string): Promise<Post | null> { ... }
  static async findAll(userId?: string): Promise<PostWithStats[]> { ... }
}
```

```typescript
// src/services/comment.service.ts
export class CommentService {
  // Responsabilidade: Gerenciar comentários (CRUD, hierarquia)
  static async create(commentData: CreateCommentData): Promise<Comment> { ... }
  static async findByPostId(postId: string, userId?: string): Promise<CommentWithStats[]> { ... }
}
```

```typescript
// src/services/reaction.service.ts
export class ReactionService {
  // Responsabilidade: Gerenciar reações (likes/dislikes)
  static async addPostReaction(postId: string, reactionData: CreateReactionData): Promise<PostReaction> { ... }
  static async addCommentReaction(commentId: string, reactionData: CreateReactionData): Promise<CommentReaction> { ... }
}
```

**2. Controllers com Responsabilidade de Orquestração**

```typescript
// src/controllers/post.controller.ts
export class PostController {
  // Responsabilidade: Orquestrar requisições HTTP para posts
  static async create(request: NextRequest) {
    const session = await requireAuthSession()
    const { title, content } = await request.json()
    
    const post = await PostService.create({
      title,
      content,
      ownerId: session.user.id,
    })
    
    return NextResponse.json({ post }, { status: 201 })
  }
}
```

**3. Separação de Responsabilidades na Arquitetura**

- **API Routes** (`app/api/*`): Apenas roteamento HTTP
- **Controllers** (`src/controllers/*`): Validação de entrada e orquestração
- **Services** (`src/services/*`): Lógica de negócio
- **Lib** (`src/lib/*`): Utilitários e configurações

---

### DIP - Dependency Inversion Principle

**Definição:** Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.

#### Implementação no Projeto

**1. Controllers Dependem de Services (Abstrações)**

```typescript
// src/controllers/post.controller.ts
import { PostService, type CreatePostData, type UpdatePostData } from "@/services/post.service"

export class PostController {
  static async create(request: NextRequest) {
    // Controller não conhece detalhes de implementação do PostService
    // Depende apenas da interface pública do service
    const post = await PostService.create({
      title,
      content,
      ownerId: session.user.id,
    })
  }
}
```

**2. Services Dependem do Prisma Client (Abstração)**

```typescript
// src/services/user.service.ts
import { prisma } from "@/lib/prisma"

export class UserService {
  // Service não instancia diretamente o Prisma
  // Depende da abstração fornecida pelo módulo lib/prisma
  static async create(userData: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        username: userData.username,
        password: hashedPassword,
      },
    })
  }
}
```

**3. API Routes Dependem de Controllers**

```typescript
// app/api/posts/route.ts
import { PostController } from "@/controllers/post.controller"

export async function GET(request: NextRequest) {
  // API Route não conhece lógica de negócio
  // Delega para o controller
  return PostController.getAll(request)
}

export async function POST(request: NextRequest) {
  return PostController.create(request)
}
```

**Benefícios da Implementação:**
- Controllers podem ser testados independentemente dos services
- Services podem ser testados independentemente do banco de dados
- Fácil substituição de implementações (ex: trocar Prisma por outro ORM)

---

### OCP - Open/Closed Principle

**Definição:** Classes devem estar abertas para extensão, mas fechadas para modificação.

#### Implementação no Projeto

**1. Services Extensíveis sem Modificação**

Os services são projetados para serem estendidos sem alterar o código existente:

```typescript
// src/services/post.service.ts - Implementação base
export class PostService {
  static async create(postData: CreatePostData): Promise<Post> {
    return prisma.post.create({
      data: {
        title: postData.title,
        content: postData.content,
        owner: { connect: { id: postData.ownerId } },
        views: 0, // Default value
      },
    })
  }
}

// Exemplo de extensão futura (sem modificar o código existente):
export class ExtendedPostService extends PostService {
  // Adicionar funcionalidades como tags, categorias, etc.
  static async createWithTags(postData: CreatePostData & { tags: string[] }): Promise<Post> {
    // Nova funcionalidade sem modificar o service original
    const post = await super.create(postData)
    // Lógica adicional para tags
    return post
  }
}
```

**2. Interfaces Extensíveis**

```typescript
// src/services/post.service.ts
export interface CreatePostData {
  title: string
  content: string
  ownerId: string
}

// Extensão futura sem quebrar código existente:
export interface ExtendedCreatePostData extends CreatePostData {
  tags?: string[]
  category?: string
  featured?: boolean
}
```

**3. Controllers Preparados para Extensão**

```typescript
// src/controllers/post.controller.ts
export class PostController {
  // Métodos podem ser sobrescritos em classes filhas
  static async create(request: NextRequest) {
    // Implementação base
  }
  
  // Ponto de extensão para validações customizadas
  protected static async validateCreateRequest(data: any): Promise<boolean> {
    return true // Implementação padrgão
  }
}
```

---

## Padrões de Projeto

### Factory Pattern

**Definição:** Padrão que fornece uma interface para criar objetos sem especificar suas classes concretas.

#### Implementação no Projeto

**1. Factory para Criação de Posts**

```typescript
// src/services/post.service.ts
export class PostService {
  // Factory pattern for creating posts with default values
  static async create(postData: CreatePostData): Promise<Post> {
    return prisma.post.create({
      data: {
        title: postData.title,
        content: postData.content,
        owner: {
          connect: { id: postData.ownerId },
        },
        views: 0, // Default value aplicado pelo Factory
      },
    })
  }
}
```

**Benefícios:**
- Valores padrão são aplicados automaticamente (views: 0)
- Lógica de criação centralizada
- Fácil manutenção e modificação

**2. Factory para Criação de Comentários**

```typescript
// src/services/comment.service.ts
export class CommentService {
  // Factory pattern for creating comments with default values
  static async create(commentData: CreateCommentData): Promise<Comment> {
    return prisma.comment.create({
      data: {
        content: commentData.content,
        ownerId: commentData.ownerId,
        postId: commentData.postId,
        parentCommentId: commentData.parentCommentId || null, // Default null
      },
    })
  }
}
```

**3. Factory para Criação de Usuários**

```typescript
// src/services/user.service.ts
export class UserService {
  // Factory pattern for creating users with default values
  static async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10) // Processamento padrão
    
    return prisma.user.create({
      data: {
        username: userData.username,
        password: hashedPassword, // Senha sempre hasheada
      },
    })
  }
}
```

**Características do Factory implementado:**
- Encapsula lógica de criação complexa
- Aplica transformações necessárias (hash de senha)
- Define valores padrão consistentes
- Simplifica a interface de criação para os controllers

---

### Singleton Pattern

**Definição:** Padrão que garante que uma classe tenha apenas uma instância e fornece um ponto de acesso global a ela.

#### Implementação no Projeto

**Singleton do Prisma Client**

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client"

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

**Como funciona:**

1. **Verificação de Instância Existente:** 
   - `globalForPrisma.prisma ?? new PrismaClient()`
   - Se já existe uma instância, reutiliza; senão, cria nova

2. **Armazenamento Global em Desenvolvimento:**
   - `globalForPrisma.prisma = prisma`
   - Evita múltiplas conexões durante hot reload

3. **Uso nos Services:**
```typescript
// src/services/post.service.ts
import { prisma } from "@/lib/prisma" // Sempre a mesma instância

export class PostService {
  static async create(postData: CreatePostData): Promise<Post> {
    return prisma.user.create({ ... }) // Usa o Singleton
  }
}
```

**Benefícios da Implementação:**
- **Performance:** Evita múltiplas conexões com o banco
- **Consistência:** Todas as operações usam a mesma instância
- **Economia de Recursos:** Uma única conexão pool
- **Desenvolvimento Friendly:** Evita problemas de hot reload

**Uso em Todos os Services:**
```typescript
// Todos os services importam a mesma instância
// src/services/user.service.ts
import { prisma } from "@/lib/prisma"

// src/services/post.service.ts  
import { prisma } from "@/lib/prisma"

// src/services/comment.service.ts
import { prisma } from "@/lib/prisma"

// src/services/reaction.service.ts
import { prisma } from "@/lib/prisma"
```

---

## 🎯 Resumo da Implementação

| Princípio/Padrão | Arquivo Principal | Implementação |
|------------------|-------------------|---------------|
| **SRP** | `src/services/*.ts` | Cada service tem responsabilidade única |
| **DIP** | `src/controllers/*.ts` | Controllers dependem de abstrações (services) |
| **OCP** | `src/services/*.ts` | Services extensíveis sem modificação |
| **Factory** | `src/services/post.service.ts`, `src/services/comment.service.ts`, `src/services/user.service.ts` | Métodos `create()` com valores padrão |
| **Singleton** | `src/lib/prisma.ts` | Instância única do Prisma Client |

Esta arquitetura garante **código limpo, testável e extensível**, seguindo as melhores práticas de engenharia de software.

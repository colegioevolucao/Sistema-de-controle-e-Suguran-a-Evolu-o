# Evolução — Painel de Estudos

Protótipo funcional e responsivo do novo registro diário do **Espaço Evoluir**, pronto para ser colocado em um repositório GitHub e publicado no GitHub Pages.

## Decisões implementadas

### Menu do aluno

- **Minha Carteira**: normal.
- **Credencial Digital**: visível, com cadeado em destaque e status **Indisponível**.
- **Meu Acesso**: visível, com cadeado em destaque e status **Indisponível**.
- **Espaço Evoluir**: disponível.

> O protótipo preserva a lógica combinada nesta conversa. Se o menu real já existir em outro módulo, use apenas a tela do Painel de Estudos.

## Página do aluno — Meu Estudo Hoje

O objetivo é o aluno registrar o estudo em poucos segundos.

### 1. O que você estudou?

- Área padronizada: Natureza, Humanas, Linguagens ou Matemática.
- Disciplina: campo aberto.
- Assunto: campo aberto.
- Até **3 registros de estudo** no mesmo dia.

### 2. Como você estudou?

Botões de múltipla escolha:

- Aula/Videoaula
- Leitura
- Resolução de questões
- Outro

Ao marcar **Outro**, aparece um campo livre.

### 3. Questões resolvidas hoje

Só aparece quando o aluno marcar **Resolução de questões**.

- Pode registrar questões de **mais de uma disciplina no mesmo dia**.
- Campos: Disciplina, Questões, Acertos.
- O desempenho percentual é calculado automaticamente.
- Acertos não podem ultrapassar o total de questões.

### 4. Minhas Anotações

Um único campo aberto:

**O que preciso revisar? / Onde parei? / Observação para o próximo estudo**

### Salvar

Existe apenas um botão principal:

**Salvar meu estudo**

Depois do salvamento, a tela mostra:

- confirmação **Estudo registrado**;
- resumo do dia;
- áreas/disciplinas/assuntos;
- como estudou;
- questões, acertos e desempenho;
- indicação de anotação registrada.

## Tempo efetivo

O aluno **não informa manualmente quanto tempo estudou**.

O tempo deve vir do próprio **Acesso Seguro / Espaço Evoluir**, usando os registros de entrada e saída das cabines.

No protótipo esse dado está simulado em `app.js`, no array `CABIN_SESSIONS`.

Na versão real, substitua essa fonte pela tabela/API já utilizada no sistema atual.

## Painel da gestão

O painel cruza:

1. quem acessou o Espaço Evoluir;
2. tempo efetivo de permanência;
3. quem registrou o estudo;
4. o que foi registrado.

### Indicadores do dia

- alunos que acessaram;
- alunos que registraram estudo;
- alunos que acessaram e não registraram;
- percentual de adesão.

### Tabela diária

A gestão visualiza:

- aluno;
- turma;
- presença no Espaço Evoluir;
- registro realizado ou não;
- tempo efetivo;
- áreas registradas;
- total de questões;
- existência de anotação.

### Filtros

- data;
- turma;
- status;
- área;
- aluno.

### Detalhamento individual

Ao clicar em um aluno, a gestão vê:

- tempo efetivo;
- estudos registrados;
- área, disciplina e assunto;
- como estudou;
- questões por disciplina;
- quantidade de questões;
- acertos;
- desempenho percentual;
- anotações.

### Visões

- **Hoje**
- **Semana**
- **Histórico**

A visão semanal permite acompanhar constância de registro e volume de questões.

## PDF — regra de gestão

Foi implementada a regra: **toda página de gestão deve oferecer a opção “Gerar PDF”**.

O protótipo usa `window.print()` com estilos específicos de impressão em **A4 horizontal**.

Ao clicar em **Gerar PDF**:

1. o navegador abre a impressão;
2. escolha **Salvar como PDF**;
3. salve o relatório.

Há opção de PDF:

- no topo do painel de gestão;
- na visão diária;
- na visão semanal;
- no histórico;
- no detalhamento individual do aluno.

## Tecnologias

Este pacote não precisa de instalação ou build:

- HTML
- CSS
- JavaScript puro
- `localStorage` para demonstrar o protótipo

Isso permite abrir o `index.html` diretamente ou publicar no GitHub Pages.

## Como testar

Basta abrir:

```text
index.html
```

Para evitar limitações do navegador com arquivos locais, também pode iniciar um servidor simples:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch `main` e a pasta `/root`.
6. Salve.

## Banco de dados sugerido

O arquivo:

```text
supabase/schema.sql
```

traz uma estrutura sugerida para persistência real:

- `study_daily_records`
- `study_items`
- `study_methods`
- `study_question_records`
- `space_evoluir_sessions` como interface de referência
- `study_management_daily` como visão de gestão
- `study_question_performance` como visão de desempenho

### Atenção

Se o **Acesso Seguro** já possui a tabela oficial de entradas e saídas, **não duplique esses dados**.

Substitua `space_evoluir_sessions` por uma `VIEW` ou adapte as consultas para a fonte oficial já existente.

## Integração com o sistema real

No protótipo:

- `CABIN_SESSIONS` simula entrada/saída e tempo efetivo;
- `MOCK_RECORDS` traz registros iniciais para demonstrar a gestão;
- `localStorage` salva os registros feitos pelo aluno.

Para produção, substitua esses pontos por API/Supabase.

Fluxo esperado:

```text
Entrada no Espaço Evoluir
        ↓
Acesso Seguro registra horário
        ↓
Aluno realiza o estudo
        ↓
Aluno registra o que estudou
        ↓
Saída registra horário final
        ↓
Sistema calcula tempo efetivo
        ↓
Gestão cruza presença + tempo + evidências de estudo
```

## Arquivos

```text
index.html            estrutura principal
styles.css            identidade visual + responsividade + impressão/PDF
app.js                regras do aluno, gestão, filtros e dados de demonstração
README.md             documentação
supabase/schema.sql   banco de dados sugerido
```

## Regras importantes para produção

- máximo de 3 blocos de estudo por registro diário;
- disciplina e assunto ficam como campos abertos;
- área fica padronizada para permitir análise;
- questões podem ser registradas em várias disciplinas no mesmo dia;
- desempenho é calculado automaticamente;
- anotações são opcionais;
- tempo efetivo vem do Espaço Evoluir, nunca é digitado pelo aluno;
- gestão sempre deve ter **Gerar PDF**;
- permissões de aluno e gestão devem ser protegidas no backend;
- aplicar RLS/policies antes de usar dados reais de alunos.

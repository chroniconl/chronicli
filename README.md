# Build Chroniconl 

This is a temp solution cli for my blog https://chroniconl.com  


### Commands

#### 1. Clean Articles Directory

- **Command:** `node index clean`
- **Description:** Cleans the articles directory by removing all its contents.
- **Action:** Executes the `cleanArticlesDirectory` function, which presumably deletes all files or performs necessary cleanup operations in the articles directory.

#### 2. Fetch All Articles

- **Command:** `node index fetch`
- **Description:** Fetches all articles without including bulky content.
- **Action:** Calls the `getPostsWithoutBulkyContent` function, which returns a list of articles excluding bulky content. The fetched articles are then logged to the console.

#### 3. Build Articles

- **Command:** `node index build [options]`
- **Description:** Builds articles based on the specified options.
- **Options:**
    - `-a, --all`: Build all articles. This option triggers the `buildAllArticles` function, which presumably compiles or processes all articles.
    - `-i, --id`: Build an article by its ID. This option requires specifying the article ID and triggers the `buildArticleById` function, which builds the specified article.
- **Action:** Depending on the options provided, it either builds all articles or a specific article by ID. If both options are specified simultaneously, it logs a message asking to specify only one option at a time.

#### Default Action

- **Action:** If no command is specified, the program logs a message indicating that no command was provided and suggests using `--help` to see available commands and options.
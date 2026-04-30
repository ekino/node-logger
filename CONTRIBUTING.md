# Contributing to @ekino/logger 🌟

First and foremost, thank you for considering a contribution to this project! 💖

Your time and effort make a difference, and every pull request, no matter the size, helps move this project forward.

Whether you're fixing a bug, adding a new feature, or improving documentation, your input is valuable. If you're new to open source, welcome! 🎉

Don't worry if you feel unsure about where to start—every bit of help is appreciated, and questions are welcome.

## How to Contribute

Follow this guide to ensure a smooth contribution process.

### Steps to Get Started

1. **Fork the Repository**  
   Start by [forking the repository](http://help.github.com/fork-a-repo/).

2. **Clone Your Fork**  
   Clone your forked repo to your local machine:

    ```bash
    git clone git@github.com:[YOUR_GITHUB_ACCOUNT]/node-logger.git
    ```

3. **Set Upstream**  
   Link back to the main project repository:

    ```bash
    git remote add upstream git://github.com/ekino/node-logger.git
    ```

4. **Sync With Upstream**  
   Fetch the latest changes from upstream, usually the main development branch:

    ```bash
    git pull upstream <dev-branch>
    ```

5. **Create a Topic Branch**  
   Create a new branch for your feature, fix, or enhancement:

    ```bash
    git checkout -b <topic-branch-name>
    ```

6. **Write Tests**  
   Ensure your changes are reliable by including tests. For small patches, a simple test is fine; for new features, create a dedicated test suite.

7. **Coding Style and Conventions**  
   This project uses [Biome](https://biomejs.dev/) for linting and formatting. For the best experience, install the [Biome extension for VS Code](https://biomejs.dev/reference/vscode/) or the extension for your IDE. This ensures automatic formatting and linting that respects the project's style.

8. **Commit Changes in Logical Chunks**  
   Split your commits into logical parts. Use git’s [interactive rebase](https://help.github.com/articles/interactive-rebase) to keep your commit history clean.

9. **Merge With Upstream**  
   Sync your branch with the latest upstream changes:

    ```bash
    git pull --rebase upstream <dev-branch>
    ```

10. **Push to Your Fork**  
    Push your topic branch to your fork:

    ```bash
    git push origin <topic-branch-name>
    ```

11. **Create a Pull Request**  
    Open a [Pull Request](http://help.github.com/send-pull-requests/) with a clear title and description, explaining why and how you made your changes.

### Guidelines for a Successful Contribution

- **Focused Scope**: Keep your PR focused; avoid unrelated changes.
- **Commit Messages**: Write meaningful commit messages. See [this guide](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html) for best practices.
- **Style Consistency**: Follow the project’s formatting and coding style.
- **Documentation**: Update documentation or comments as needed to explain your changes.

### Need Help?

If anything is unclear, or if you're facing any issues while contributing, please don’t hesitate to [open an issue](https://github.com/ekino/node-logger/issues/new/choose). We're here to help!


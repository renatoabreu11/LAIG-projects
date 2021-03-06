# LAIG
Repository to host Graphical Applications Laboratory projects.

LAIG is a course given at FEUP in the third year of the Master in Informatics and Computing Engineering.
 
## Goals

### Project 1
The main goal of this project was to build a 3d graphic application. It reads the components of a given scene, specified by a text file, and displays it.

The text file must comply with a defined language, DSX - Description of Scenes in XML, which obeys to a concept widely used in Computer Graphics: Scene graph. Furthermore, the syntax follows the XML tags format.
 
Therefore, the application reads and transverses all the dsx nodes, while simultaneously builds the respective data structure - scene graph. After reading and loading the info, the scene is then displayed.

| [<img src="/res/P1View1.jpg" width="256" heigth="256">](/res/P1View1.jpg)                                                               | [<img src="/res/P1View2.jpg" width="256" heigth="256">](/res/P1View2.jpg)                                                               | [<img src="/res/P1View3.jpg" width="256" heigth="256">](/res/P1View3.jpg) |
|:---:|:---:|:---:|
| View 1 | View 2 | View 3 |

### Project 2
The goal of this project was to add new graphic functionalities to the work developed in the last project.

As such, by using the parser previously developed and extending the DSX language, we added the following features: 
* Animations (linear and circular)
* 2D/3D surfaces 
* Shaders based in GLSL ES 1.0

| [<img src="/res/MainScene.jpg" width="256" heigth="256">](/res/MainScene.jpg)                                                           | [<img src="/res/Animations.gif" width="256" heigth="256">](/res/Animations.gif)                                                         | [<img src="/res/Boards.gif" width="256" heigth="256">](/res/Boards.gif) |
|:---:|:---:|:---:|
| Scene | Animations and Shaders | Boards |

### Project 3
The goal was to develop a graphical interface for a Prolog game developed in the [Logic Programming](https://github.com/renatoabreu11/PLOG-projects) course, which in our case was the puzzle game [Nodes](https://www.thegamecrafter.com/games/nodes).

#### Features
* Player Vs Player, [Player Vs AI](/res/PlayerVsAI.gif), AI Vs AI (with two difficulty modes)
* Undo last play or reset turn plays
* Game Movie
* Key frame animations
* Switching between predefined scenarios
* Switching between predefined cameras (different for each player)
* Game statistics and player turn timer

| [<img src="/res/PlayerVsPlayer.gif" width="256" heigth="256">](/res/PlayerVsPlayer.gif)                                               | [<img src="/res/GameMovie.gif" width="256" heigth="256">](/res/GameMovie.gif) |
|:---:|:---:|
| Player Vs Player | Game Movie |

[How to Play](https://github.com/renatoabreu11/LAIG-projects/blob/master/Project%203/docs/Manual.pdf)

## Team 
[Diogo Duque](https://github.com/DiogoDuque)

[Renato Abreu](https://github.com/renatoabreu11)

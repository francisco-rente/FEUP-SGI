# SGI 2022/2023 - TP2

## Group: T01G03

| Name             | Number    | E-Mail             |
| ---------------- | --------- | ------------------ |
| António Ribeiro         | 201906761 | up201906761@edu.fe.up.pt|
| Pedro Pinheiro         | 201906788 | up201906788@edu.fe.up.pt|


----
## Project information



### Scene 
- All elements specified in the project statement were implemented.
- A barrel with two circle tops was added to the scene (the tops were made using a single primitive patch).
- A rectangle was added to the scene with the texture of van goh's starry night.
- A curved tent now sits besides the other tent.
- An initial animation plays with the barrel and the tent positions, finally placing them in their correct positions.
- [Scene](tp2/scenes/SGI_TP1_XML_T01_G03_v03.xml)
- [Screenshots](tp2/screenshots)


![Scene](./scene.png)

### Technical information

- Highlight tag parsing was implemented in the MySceneGraph class. 
- It updates the highlight information in a MyComponent object, which is then used in the scene display (by updating the uniform values and setting the active shader).
- The shaders' values are updated by a GUI color picker and a scale slider.
- The shader's values are updated according to a sinusoid function applied to the time.
- Animation parsing was implemented in the MySceneGraph class.
- They are stored as a MyKeyframeAnimation object, which in turn saves multiple MyKeyFrames.
- These contain the transformation values, later computed by the MyKeyframeAnimation class, in an scene update(t) instance.
- Values are interpolated using a lerp function, and then the matrix is computed/updated.
- The animation is applied when the component is displayed, in the correct time context.
- Several parsing verifications were added, such as verifying the order of the transformations in the animation (e.g. translation before rotation).
- And the instance time ordering in the sxs, besides existence verifications (e.g. animation id exists).
- Control points quantity verification was also added, to ensure that the patch is a valid primitive.

----
## Issues/Problems

- The interface was very troublesome to implement, relative to the components values (e.g. the color is picked (in the GUI) and stored (in the shader) in two different formats 0-255 and 0-1).
- The pulsar animation is difficult to achieve using the standard (sin(t) + 1) / 2, calculation. 
- The position of points of the circle and barrel tops were difficult to achieve, the correct ordering is not always intuitive and takes a lot of time to get right.
- The same can be said about the points' parsing. 
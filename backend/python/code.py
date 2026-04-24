from manim import *

class Hello(Scene):
    def construct(self):
        text = Text("Hello Manim!")
        self.play(Write(text))
        self.wait()

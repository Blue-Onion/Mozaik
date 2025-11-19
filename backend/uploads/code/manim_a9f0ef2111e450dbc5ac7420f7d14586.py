from manim import *

class DynamicAngleAnimation(Scene):
    def construct(self):
        rotation_center = LEFT * 3.5

        angle_tracker = ValueTracker(110 * DEGREES)

        reference_line = Line(rotation_center, rotation_center + RIGHT * 2.5, color=WHITE)
        rotating_line = Line(rotation_center, rotation_center + RIGHT * 2.5, color=YELLOW)

        angle_arc = Angle(
            reference_line, rotating_line, radius=0.5, other_angle=False
        )
        theta_label = MathTex(r"\theta").move_to(
            Angle(
                reference_line, rotating_line, radius=0.5 + 3 * SMALL_BUFF, other_angle=False
            ).get_center()
        )

        angle_group = VGroup(rotating_line, angle_arc, theta_label)

        angle_group.add_updater(
            lambda mob: mob[0].become(
                Line(
                    start=rotation_center,
                    end=rotation_center + RIGHT * 2.5,
                ).rotate(angle_tracker.get_value(), about_point=rotation_center)
            )
        )
        angle_group.add_updater(
            lambda mob: mob[1].become(
                Angle(reference_line, rotating_line, radius=0.5, other_angle=False)
            )
        )
        angle_group.add_updater(
            lambda mob: mob[2].move_to(
                Angle(
                    reference_line, rotating_line, radius=0.5 + 4 * SMALL_BUFF, other_angle=False
                ).point_from_proportion(0.5)
            )
        )

        self.add(reference_line, angle_group)
        self.wait(0.5)

        self.play(
            angle_tracker.animate.set_value(40 * DEGREES),
            run_time=2,
            rate_func=smooth
        )
        self.wait(0.5)

        self.play(
            angle_tracker.animate.set_value((40 + 140) * DEGREES),
            Succession(
                Wait(0.7),
                ApplyMethod(theta_label.set_color, RED),
                Wait(0.6),
                ApplyMethod(theta_label.set_color, WHITE)
            ),
            run_time=2.5,
            rate_func=smooth
        )
        self.wait(0.5)

        self.play(
            angle_tracker.animate.set_value(350 * DEGREES),
            run_time=3,
            rate_func=smooth
        )
        self.wait(1)
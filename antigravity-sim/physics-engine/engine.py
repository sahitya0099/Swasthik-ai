"""
Antigravity Physics Engine
Calculates forces and updates object positions using an inverse gravity model.
Objects experience upward force (antigravity), mutual repulsion, and drag.
"""

import math
from typing import List, Dict, Any

# Constants
REPULSION_CONSTANT = 500.0    # Strength of object-to-object repulsion
DRAG_COEFFICIENT = 0.02       # Air resistance coefficient
BOUNCE_DAMPING = 0.8          # Energy retained after boundary bounce
CANVAS_WIDTH = 800
CANVAS_HEIGHT = 500
MIN_DISTANCE = 5.0            # Prevent division by zero in repulsion


def calculate_antigravity_force(mass: float, antigravity_strength: float) -> tuple:
    """
    Calculate the antigravity force on an object.
    Antigravity pushes objects UPWARD (negative y in canvas coordinates).
    """
    fx = 0.0
    fy = -antigravity_strength * mass  # Negative = upward in canvas coords
    return fx, fy


def calculate_repulsion_force(
    obj: Dict[str, Any],
    others: List[Dict[str, Any]]
) -> tuple:
    """
    Calculate the repulsive force on an object from all other objects.
    Uses inverse-square law similar to electrostatic repulsion.
    """
    fx_total = 0.0
    fy_total = 0.0

    for other in others:
        if other["id"] == obj["id"]:
            continue

        dx = obj["x"] - other["x"]
        dy = obj["y"] - other["y"]
        distance = math.sqrt(dx * dx + dy * dy)
        distance = max(distance, MIN_DISTANCE)

        # Inverse-square repulsion: F = k * m1 * m2 / r^2
        force_magnitude = REPULSION_CONSTANT * obj["mass"] * other["mass"] / (distance * distance)

        # Direction: away from the other object
        fx_total += force_magnitude * (dx / distance)
        fy_total += force_magnitude * (dy / distance)

    return fx_total, fy_total


def calculate_drag_force(vx: float, vy: float) -> tuple:
    """
    Calculate drag force opposing the current velocity.
    """
    return -DRAG_COEFFICIENT * vx, -DRAG_COEFFICIENT * vy


def apply_boundary_collision(obj: Dict[str, Any]) -> Dict[str, Any]:
    """
    Bounce objects off canvas edges with energy loss.
    """
    radius = obj.get("radius", 10)

    # Left boundary
    if obj["x"] - radius < 0:
        obj["x"] = radius
        obj["vx"] = abs(obj["vx"]) * BOUNCE_DAMPING

    # Right boundary
    if obj["x"] + radius > CANVAS_WIDTH:
        obj["x"] = CANVAS_WIDTH - radius
        obj["vx"] = -abs(obj["vx"]) * BOUNCE_DAMPING

    # Top boundary
    if obj["y"] - radius < 0:
        obj["y"] = radius
        obj["vy"] = abs(obj["vy"]) * BOUNCE_DAMPING

    # Bottom boundary
    if obj["y"] + radius > CANVAS_HEIGHT:
        obj["y"] = CANVAS_HEIGHT - radius
        obj["vy"] = -abs(obj["vy"]) * BOUNCE_DAMPING

    return obj


def simulate_step(
    objects: List[Dict[str, Any]],
    antigravity_strength: float,
    dt: float
) -> List[Dict[str, Any]]:
    """
    Perform one simulation step for all objects.

    For each object:
      1. Calculate antigravity force (upward)
      2. Calculate repulsion from other objects
      3. Calculate drag force
      4. Sum forces → acceleration
      5. Update velocity (Euler integration)
      6. Update position
      7. Apply boundary collisions
    """
    updated_objects = []

    for obj in objects:
        mass = obj["mass"]

        # 1. Antigravity (upward push)
        ag_fx, ag_fy = calculate_antigravity_force(mass, antigravity_strength)

        # 2. Repulsion from other objects
        rep_fx, rep_fy = calculate_repulsion_force(obj, objects)

        # 3. Drag
        drag_fx, drag_fy = calculate_drag_force(obj["vx"], obj["vy"])

        # 4. Net force and acceleration (F = ma → a = F/m)
        net_fx = ag_fx + rep_fx + drag_fx
        net_fy = ag_fy + rep_fy + drag_fy
        ax = net_fx / mass
        ay = net_fy / mass

        # 5. Update velocity
        new_vx = obj["vx"] + ax * dt
        new_vy = obj["vy"] + ay * dt

        # 6. Update position
        new_x = obj["x"] + new_vx * dt
        new_y = obj["y"] + new_vy * dt

        updated_obj = {
            "id": obj["id"],
            "x": new_x,
            "y": new_y,
            "vx": new_vx,
            "vy": new_vy,
            "mass": mass,
            "radius": obj.get("radius", 10),
        }

        # 7. Boundary collision
        updated_obj = apply_boundary_collision(updated_obj)
        updated_objects.append(updated_obj)

    return updated_objects

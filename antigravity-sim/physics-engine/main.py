"""
Flask server for the Antigravity Physics Engine.
Exposes endpoints for physics calculations.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from engine import simulate_step

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "antigravity-physics-engine"})


@app.route("/physics/calculate", methods=["POST"])
def calculate_physics():
    """
    Calculate one step of the antigravity simulation.
    Receives objects with current positions/velocities,
    returns updated positions/velocities after applying forces.
    """
    try:
        data = request.get_json()

        if not data or "objects" not in data:
            return jsonify({"error": "'objects' field is required"}), 400

        objects = data["objects"]
        antigravity_strength = data.get("antigravity_strength", 9.8)
        dt = data.get("dt", 0.016)

        # Validate
        if not isinstance(objects, list):
            return jsonify({"error": "'objects' must be an array"}), 400

        if dt <= 0 or dt > 0.1:
            return jsonify({"error": "'dt' must be between 0 and 0.1"}), 400

        if antigravity_strength < 0:
            return jsonify({"error": "'antigravity_strength' must be >= 0"}), 400

        # Validate each object has required fields
        required_fields = ["id", "x", "y", "mass"]
        for obj in objects:
            for field in required_fields:
                if field not in obj:
                    return jsonify({"error": f"Object missing required field: '{field}'"}), 400
            # Set defaults
            obj.setdefault("vx", 0.0)
            obj.setdefault("vy", 0.0)
            obj.setdefault("radius", 10.0)

        updated = simulate_step(
            objects=objects,
            antigravity_strength=antigravity_strength,
            dt=dt,
        )

        return jsonify({"objects": updated})

    except Exception as e:
        return jsonify({"error": f"Physics calculation error: {str(e)}"}), 500


if __name__ == "__main__":
    print("\n[*] Antigravity Physics Engine running on http://localhost:8000\n")
    app.run(host="0.0.0.0", port=8000, debug=True)

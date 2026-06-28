# CASE FILE 07: ADMIN DECRYPTION SHEET

This document contains all keys, parity grids, solutions, and logical paths for Case File 07. Keep this secure and distribute only to organizers/admins.

---

## 🔑 STAGE 5: SYMBOL RECONSTRUCTION SOLUTIONS

### 1. Matrix Parity Puzzle
*   **Objective**: Make rows 1 & 5 and cols 2 & 4 odd; rows 2-4 and cols 1, 3, 5 even. Activate exactly 12 cells. Indices (2,2) and (3,3) must be 0 (OFF).
*   **Correct Grid (1 = ON, 0 = OFF)**:
    ```
    [1, 1, 0, 1, 0]
    [0, 1, 1, 0, 0]
    [1, 0, 0, 0, 1]
    [0, 0, 1, 1, 0]
    [0, 1, 0, 1, 1]
    ```

### 2. Network Packet Decoder
*   **Payload Bytes Hex Dump**: `53 48 49 45 4c 44` (located at the end of the packet dump)
*   **Decoded ASCII Output (Bypass Answer)**: `SHIELD`

### 3. Combinational Lock Circuit
*   **Switches Configuration**:
    *   **ON (1)**: A, C, E, F
    *   **OFF (0)**: B, D, G, H

### 4. Vigenère Decryption
*   **Ciphertext**: `ZXHHPZM`
*   **Decryption Key**: `SHIELD`
*   **Plaintext Output (Bypass Answer)**: `REPLACE`

---

## 💾 FINAL ACT: MESSAGE RECONSTRUCTION SOLUTIONS

### 1. Stage A: Chrono-Registry Logic Grid (Zebra Puzzle)
*   **Objective**: Align variables across 5 facility sectors based on 18 logical log clues.
*   **Registry Solution Table**:
    | Field | Sector 1 | Sector 2 | Sector 3 | Sector 4 | Sector 5 |
    | :--- | :--- | :--- | :--- | :--- | :--- |
    | **Researcher** | Wesker | Ada | Sherry | Claire | Leon |
    | **Virus Strain**| T-Virus | Las Plagas | T-Veronica | G-Virus | Uroboros |
    | **Keycard** | Green | Red | Blue | Yellow | Purple |
    | **Offset** | -2h | -1h | 0h | +1h | +2h |

### 2. Stage B: 3D Dodecahedron Path Router
*   **Objective**: Traverse all 20 vertices exactly once starting at node `0` (Hamiltonian path).
*   **Example Solved Path Sequences**:
    *   `0 ➔ 8 ➔ 1 ➔ 13 ➔ 5 ➔ 10 ➔ 11 ➔ 6 ➔ 18 ➔ 17 ➔ 2 ➔ 14 ➔ 15 ➔ 7 ➔ 19 ➔ 4 ➔ 12 ➔ 0` (Non-hamiltonian loop)
    *   Any path that visits all 20 nodes once consecutively is auto-accepted.

### 3. Stage C: Sliding Laser Beam Splitter
*   **Objective**: Slide the metallic blocks on the 6x6 board to guide the laser beam from emitter `(2,0)` to hit the top receptor `(0,4)` and right receptor `(3,5)` simultaneously.
*   **Correct Grid Positions**:
    *   **Block 0** (Horizontal 1x2, `/` mirror): `x = 2, y = 2` (mirror at `(2,2)`)
    *   **Block 1** (Vertical 2x1, `\` mirror): `x = 2, y = 0` (mirror at `(1,2)`)
    *   **Block 2** (Horizontal 1x2, `S` splitter): `x = 4, y = 1` (splitter at `(1,4)`)
    *   **Block 3** (Vertical 2x1, `/` mirror): `x = 4, y = 3` (mirror at `(3,4)`)
    *   **Obstacles**: Block 4 stays at `(0,4)`, Block 5 stays at `(5,1)`.


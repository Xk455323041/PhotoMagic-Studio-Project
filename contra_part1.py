html = """<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<title>魂斗罗 - 第一关</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: monospace; }
canvas { image-rendering: pixelated; border: 2px solid #444; }
#info { color: #888; font-size: 12px; margin-top: 8px; }
</style>
</head>
<body>
<canvas id="game"></canvas>
<div id="info">方向键移动 | 上/空格跳跃 | Z/X射击 | 下键趴下</div>
<script>

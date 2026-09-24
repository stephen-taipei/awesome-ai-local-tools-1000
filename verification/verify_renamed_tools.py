"""Compatibility entry point for the assertion-based browser suite."""
import asyncio
from browser_smoke import run
if __name__ == '__main__':
    raise SystemExit(asyncio.run(run()))

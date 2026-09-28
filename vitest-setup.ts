// happy-dom has no layout engine and no ResizeObserver; the core only uses it
// to refit percent sizes, so a no-op is enough for component tests.
class NoopResizeObserver implements ResizeObserver {
	disconnect() {}
	observe() {}
	unobserve() {}
}

globalThis.ResizeObserver ??= NoopResizeObserver;

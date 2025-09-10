// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

// biome-ignore lint/style/noNonNullAssertion: Solid made sure app exist
mount(() => <StartClient />, document.getElementById("app")!);

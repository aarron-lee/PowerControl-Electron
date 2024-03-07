const plugin_name = "PowerControl";

async function call_plugin_method(method_name, arg_object = {}) {
  if (plugin_name == undefined)
    throw new Error(
      "Plugin methods can only be called from inside plugins (duh)"
    );
  const token = await fetch("http://127.0.0.1:1337/auth/token").then((r) =>
    r.text()
  );
  const response = await fetch(
    `http://127.0.0.1:1337/plugins/${plugin_name}/methods/${method_name}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authentication: token,
      },
      body: JSON.stringify({
        args: arg_object,
      }),
    }
  );

  const dta = await response.json();
  if (!dta.success) throw dta.result;
  return dta.result;
}

const serverAPI = {
  callPluginMethod: call_plugin_method,
};

export default serverAPI;

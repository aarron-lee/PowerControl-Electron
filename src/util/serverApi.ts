const plugin_name = "PowerControl";

async function callPluginMethod(method_name: string, arg_object = {}) {
  console.log(method_name, plugin_name, arg_object);
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

  console.log(method_name, token, response);

  let dta;

  if (response?.ok && response instanceof Promise) {
    dta = await response.json();
  } else {
    return response;
  }

  if (!dta) {
    throw new Error(`missing dta ${dta}`);
  }

  console.log(dta);

  if (!dta.success) throw dta.result;
  return dta.result;
}

export const serverAPI = {
  callPluginMethod,
};

export default serverAPI;

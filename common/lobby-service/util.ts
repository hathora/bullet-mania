export async function postJson(url: string, body: object, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return maybeGetHttpError(res);
}
export async function getJson(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    headers: { ...headers, "Content-Type": "application/json" },
  });
  return maybeGetHttpError(res);
}

async function maybeGetHttpError(res: Response) {
  if (!res.ok) {
    return Promise.reject(`Request failed with status ${res.status} and ${await res.text()}`);
  } else {
    return await res.json();
  }
}

export async function poll<Intermediate, Target extends Intermediate>(
  fn: () => Promise<Intermediate>,
  validate: (a: Intermediate) => a is Target,
  interval: number,
  maxAttempts: number
): Promise<Target> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const res = await fn();
    if (validate(res)) {
      return res;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
    attempts++;
  }
  throw new Error("Polling timed out");
}

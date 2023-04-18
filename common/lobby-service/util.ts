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

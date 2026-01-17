const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
});

const normalizeId = (s: string) => s.trim().replace(/\s+/g, " ");

export const compareIds = (a: string, b: string) => {
    const na = normalizeId(a);
    const nb = normalizeId(b);

    const c = collator.compare(na, nb);
    if (c !== 0) return c;

    return na.length - nb.length;
};

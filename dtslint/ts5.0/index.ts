declare let a: () => Omit<{}, "b"> & { a: string };

// $ExpectType { a: string }
a();

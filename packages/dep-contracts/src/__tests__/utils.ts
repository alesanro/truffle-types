export function unique<T>(arr: T[]): T[] {
    return arr.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });
}

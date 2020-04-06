/**
 * Async array search
 *
 * @param collection The collection to find within
 * @param predict The prediction funciton
 */
export async function findAsync<T>(
    collection: T[],
    predict: (elem: T) => Promise<boolean>
): Promise<T> {
    const predictions = collection.map((elem) => predict(elem));
    const results = await Promise.all(predictions);
    const firstBoosterIndex = results.indexOf(true);
    return collection[firstBoosterIndex];
}

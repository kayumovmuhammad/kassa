interface FetcherOptions {
    url: string;
    method?: string;
    headers?: object;
    body?: object;
}

export default async function fetcher(props: FetcherOptions) {
    const { url, method, headers, body } = props;
    const response = await fetch(url, {
        method: method || "GET",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
            ...headers,
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        let errorMsg = `Ошибка HTTP: ${response.status}`;
        try {
            const errorData = await response.json();
            // Попробуем достать текст ошибки (зависит от вашего бэкенда)
            errorMsg = errorData.message || errorData.detail || errorData.error || errorMsg;
        } catch (e) {
            // Если ответ не в формате JSON, просто оставляем статус
        }
        throw new Error(errorMsg);
    }
    return response.json();
}
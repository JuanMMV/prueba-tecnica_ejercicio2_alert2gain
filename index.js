import axios from "axios";

const host = `https://devtest.a2g.io/api/`;
const accessCredentials = {
    Email: "juan.menares.vega@gmail.com",
    Password: "9kfqqOapc5YPpIqZS9uq",
};
const sensorId = "fb76277a-5872-4d74-a80b-4cce592c9e12";
let token;

const getTokenAuth = async () => {
    try {
        const res = await axios.post(`${host}Auth`, accessCredentials);
        return res.data.token;
    } catch (error) {
        return error.response.status;
    }
};

const getRecordsTotalPages = async () => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            pageSize: 1000,
        },
    };
    const resp = await axios.get(`${host}Records/${sensorId}`, config);
    return resp.data.totalPages;
};

const getRecords = async (actualPage) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            pageSize: 1000,
            pageNumber: actualPage,
        },
    };
    const resp = await axios.get(`${host}Records/${sensorId}`, config);
    return resp.data.data;
};

const sortByRange = async (data, counters) => {
    for (const item of data) {
        if (item.value >= 0 && item.value <= 60) {
            counters.low += 1;
        } else if (item.value > 60 && item.value <= 120) {
            counters.medium += 1;
        } else {
            counters.high += 1;
        }
    }
};


const loopPages = async (recordsMaxPage) => {
    console.log('Cargando...');
    let counters = { low: 0, medium: 0, high: 0 };
    let actualPage = recordsMaxPage;

    while (actualPage > 0) {
        const dataAPI = await getRecords(actualPage);
        await sortByRange(dataAPI, counters);
        actualPage -= 1;
    }

    console.log('Ejercicio N1');
    console.log("N° bajo:", counters.low);
    console.log("N° medio:", counters.medium);
    console.log("N° alto:", counters.high);
    return counters
};


const convertTime = async (dateRage, dateCounter) => {

    for (const item of dateRage) {
        const dateUTC = new Date(item.ts)
        const startDate = new Date('2023-04-10T08:00:00.000Z')
        const endDate = new Date('2023-04-11T20:00:00.000Z')

        dateUTC.setUTCHours(dateUTC.getUTCHours() - 4);
        if (dateUTC >= startDate && dateUTC <= endDate) {
            dateCounter.value += 1
        }
    }
}

const sensorDates = async (recordsMaxPage) => {
    console.log('Cargando...');
    let dateCounter = { value: 0 };
    let actualPage = recordsMaxPage;

    while (actualPage > 0) {
        const dataAPI = await getRecords(actualPage);
        await convertTime(dataAPI, dateCounter);
        actualPage -= 1;
    }
    console.log('Ejercicio N2:');
    console.log(`Entre 10-04-2023 08:00 y las 11-04-2023 20:00 hay ${dateCounter.value} registros`);
    console.log('Registros: ', dateCounter.value);
    return dateCounter
};


export const sendData = async (sortRage, dateRange) => {
    try {
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        
        const res = await axios.post(`${host}Result`, {
            noiseHigh: sortRage.high,
            noiseMedium: sortRage.medium,
            noiseLow: sortRage.low,
            rangeAmount: dateRange.value,
        }, config);

        if (res.status == 200) {
            console.log('Datos enviados con exito');
            console.log(res.data.message)
        } else {
            console.log('No se pudieron enviar los datos...');
        }
    } catch (error) {
        console.error(error);
    }
};

const main = async () => {
    // Obtención del token
    token = await getTokenAuth();
    // Numero maximo de paginas
    const recordsMaxPage = await getRecordsTotalPages(token);
    // ejercicio: 1
    const sortRage = await loopPages(recordsMaxPage);
    // ejercicio: 2
    const dateRange = await sensorDates(recordsMaxPage)
    await sendData(sortRage, dateRange)
};

main();

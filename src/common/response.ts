export default interface IResponseItem {
    meta: IMeta;
    response: any;
}

interface IMeta {
    errCode: number;
    msg: string;
}

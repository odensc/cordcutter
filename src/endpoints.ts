import axios from "axios";

const endpoints = {
	url: "https://discordapp.com/api",
	gateway: {
		gateway()
		{
			return json("/gateway") as Promise<ResponseGateway>;
		}
	}
};

// helper functions
function json(url: string)
{
	return axios
		.get(endpoints.url + url, {timeout: timeout})
		.then(r => r.data);
}

let timeout: number;

export function setTimeout(_timeout: number)
{
	timeout = _timeout;
}

export interface ResponseGateway
{
	url: string;
}

export default endpoints;

// import { AxiosError } from "axios";
import { err } from "./articleAPI";
import API from "./axios";
import { Cookies } from "react-cookie";
import { queryClient } from "./tanstackQuery";

export interface AnimalInfo {
  id: number;
  code: string;
  breed: string;
  age: number;
  image: string;
}

export interface BoadcastData {
  title: string;
  description: string;
  animalInfo: number[];
  sessionId: string;
  thumbnailImgUrl: string;
}

interface RequestBroadCastInterface {
  signal?: AbortSignal;
  data: BoadcastData;
}

const URL = "api/streamings";

export const requestBroadCast = async ({
  signal,
  data,
}: RequestBroadCastInterface) => {
  const cookie = new Cookies();
  const token = cookie.get("U_ID");
  try {
    const response = await API.post(URL, data, {
      signal,
      method: "POST",
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch {
    throw err;
  }
};

export interface CallAnimal {
  animalId: number;
  code: string;
  age: number;
  imgUrl: string;
  breed: string;
}

interface Siganl {
  signal: AbortSignal;
}
export const callAnimal = async ({ signal }: Siganl) => {
  const cookie = new Cookies();
  const token = cookie.get("U_ID");

  try {
    const response = await API.get(URL + "/animals", {
      signal,
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    return response.data as CallAnimal[];
  } catch {
    return [];
  }
};

interface signal {
  signal: AbortSignal;
}

export interface broadcastInfo {
  title: string;
  orgNickname: string;
  sessionId: string;
  thumbnailImgUrl: string;
  streamingId: number;
}

export const broadcastList = async ({ signal }: signal) => {
  const cookie = new Cookies();
  const token = cookie.get("U_ID");

  try {
    const response = await API.get(URL, {
      signal,
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    return response.data as broadcastInfo[];
  } catch {
    return [];
  }
};

interface BroadcastEndInterface {
  sessionId: string;
}

export const broadcastEnd = async ({ sessionId }: BroadcastEndInterface) => {
  const cookie = new Cookies();
  const token = cookie.get("U_ID");

  try {
    await API.delete(URL + "/" + sessionId, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });
    queryClient.invalidateQueries({ queryKey: ["broadcastList"] });
  } catch {
    return;
  }
};

export interface BroadcastAnimalInfo {
  animalId: number;
  code: string;
  breed: string;
  age: number;
  imgUrl: string;
}

interface BroadcastIdProps extends signal {
  streamingId: number;
}

export const broadcastAnimalInfo = async ({
  signal,
  streamingId,
}: BroadcastIdProps) => {
  const cookie = new Cookies();
  const token = cookie.get("U_ID");

  try {
    const response = await API.get(URL + "/" + streamingId + "/animals", {
      signal,
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    return response.data as BroadcastAnimalInfo[];
  } catch {
    return [];
  }
};

export interface BroadcastDetailInterface {
  title: string;
  description: string;
}

export const broadCastDetail = async ({ streamingId }: BroadcastIdProps) => {
  const cookie = new Cookies();
  const token = cookie.get("U_ID");

  try {
    const response = await API.get(URL + "/" + streamingId + "/detail", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    return response.data as BroadcastDetailInterface;
  } catch {
    return {} as BroadcastDetailInterface;
  }
};

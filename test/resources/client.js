import RestHeartClient from "restheart-client";
import token from "./restheart/token";

const client = new RestHeartClient({
    token,
    database: "test",
    baseUrl: "http://localhost:5151"
});

export const BigTestCollection = client.getModel("bigtestcollection");
export const TestCollection = client.getModel("testcollection");
export const NonExistentTestCollection = client.getModel("nonexistenttestcollection");
export const DynamicTestCollection = client.getModel("dynamictestcollection");
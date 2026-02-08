import dns from "dns/promises";


export class DNSresolution {

    static async ping(host: string){

        try {
            const result = await dns.lookup(host)
            return result

        } catch (error) {
            const errObj = {
                type: "error",
                value: error
            }
            return errObj
        }

    }
}


import chalk from 'chalk';

export class Helper {

    static printInfo(ctx: string) {
        const currentTime = this.getCurrentTime()
        const str = `[${currentTime}][inf] - ${ctx}\n`

        process.stdout.write(str)
    }

    static printErr(ctx: string) {
        const currentTime = this.getCurrentTime()
        const str = chalk.red(`[${currentTime}][err] - ${ctx}\n`)

        process.stdout.write(str)
    }

    static printWar(ctx: string) {
        const currentTime = this.getCurrentTime()
        const str = chalk.yellow(`[${currentTime}][war] - ${ctx}\n`)

        process.stdout.write(str)
    }



    private static getCurrentTime() {
        const currentTime = new Date();

        const formatted =
            String(currentTime.getDate()).padStart(2, '0') + '-' +
            String(currentTime.getMonth() + 1).padStart(2, '0') + '-' +
            currentTime.getFullYear() + ' ' +
            String(currentTime.getHours()).padStart(2, '0') + ':' +
            String(currentTime.getMinutes()).padStart(2, '0');

        return formatted
    }
}
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/demos/ui/marquee";


export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden pt-0 text-black dark:bg-white">
      <div className="relative z-10 mx-auto h-full w-full max-w-full">
        <div className="grid grid-cols-1 md:h-[calc(100vh-3.5rem)] md:grid-cols-12">
          <div className="h-56 w-full sm:h-72 md:col-span-6 md:h-full">
            <Image
              alt="Tennisplatz Hardter Tennisverein"
              className="h-full w-full overflow-hidden object-cover object-center"
              height={1080}
              src="/images/hero-new.png"
              width={1920}
              priority
            />
          </div>

          <div className="flex w-full items-center justify-between px-5 pt-7 pb-8 text-left sm:px-6 md:col-span-6 md:pt-20 md:pr-6 md:pb-0 md:pl-10">
            <div className="w-full max-w-3xl space-y-5 md:space-y-6">
              <h1 className="font-kanturmuy font-normal text-3xl tracking-tighter sm:text-4xl md:text-6xl lg:text-7xl">
                Herzlich Willkommen beim Hardter TV
              </h1>

              <p className="max-w-2xl font-light text-sm sm:text-base md:text-lg lg:text-xl">
                Erlebe die Freude am Tennis und die Kraft der Gemeinschaft.
                Verbinde dich mit Gleichgesinnten und wachse gemeinsam im Sport.
              </p>
              <div className="mt-auto space-y-7">
                <div className="flex w-fit gap-6">
                  <Link href="/mitgliedschaft">
                    <Button className="group not-disabled:inset-shadow-none mx-auto flex cursor-pointer items-center justify-center gap-0 rounded-full border-none bg-transparent px-0 py-5 font-normal shadow-none hover:bg-transparent [:hover,[data-pressed]]:bg-transparent">
                      <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad] group-hover:transition-colors">
                        Mitglied werden
                      </span>
                      <div className="relative flex h-fit cursor-pointer items-center overflow-hidden rounded-full bg-[#e1fcad] p-5 text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad] group-hover:transition-colors">
                        <ArrowUpRight className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                        <ArrowUpRight className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                      </div>
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative -mx-4 mt-8 sm:-mx-6 lg:-mx-8">
                <div className="absolute left-0 z-40 h-full w-20 bg-linear-to-r from-white" />
                <div className="absolute right-0 z-40 h-full w-20 bg-linear-to-l from-white" />

                <Marquee className="[--duration:25s]" pauseOnHover repeat={2}>
                  {[5, 6, 7, 8, 9, 10, 11].map((i) => (
                    <div
                      className="flex items-center justify-center px-3 md:px-5"
                      key={i}
                    >
                      <Image
                        alt={`Partner Logo ${i}`}
                        className="h-8 md:h-12 object-contain"
                        style={{ width: 'auto' }}
                        height={48}
                        src={`/images/image copy ${i}.png`}
                        width={120}
                      />
                    </div>
                  ))}
                </Marquee>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

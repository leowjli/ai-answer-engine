import Groq from "groq-sdk";
import * as cheerio from 'cheerio';
import puppeteer from "puppeteer";
import dotenv from 'dotenv';

dotenv.config();

export async function POST(req: Request) {
  try {
    // parse the req body
    const { message } = await req.json();

    if (typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid message format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // initialize groq api key
    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    let aiRes: string = "";
    const citations: string[] = [];

    if (message.toLowerCase().includes("https") || message.toLowerCase().includes("scrape")) {
      // get the url link
      const urls = message.match(/https?:\/\/[^\s]+/);

      // if url exists, use scrapping
      if (urls && urls.length > 0) {
        const allContent = urls.map(async (url: string) => {
          // scarpping here
          const content = await ScrapeWeb(url);

          // we can get an AI generated summary here
          const summary = await client.chat.completions.create({
            messages: [{ role: 'user', content: `Please give me a summary of the following website: \n\n${content}` }],
            model: 'llama3-8b-8192',
          });

          // adding the citations here
          citations.push(url);

          return summary.choices[0].message.content ?? "I could not summarize this website.";
        })
        
        const allSummaries = await Promise.all(allContent);
        aiRes = allSummaries.join("\n\n");
        console.log(aiRes);
      } else {
        aiRes = "Could you provide the link the website you want more information for?";
      }
    } else {
      const chatCompletion = await client.chat.completions.create({
        messages: [{ role: 'user', content: message }],
        model: 'llama3-8b-8192',
      });
  
      aiRes = chatCompletion.choices[0].message.content ?? "Uh oh I got nothing";
      console.log(aiRes);
    }

    if (citations.length > 0) {
      aiRes += "\n\nCitations for the URLs:\n" + citations.join("\n");
    }

    return new Response(
      JSON.stringify({ reply: aiRes }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request: ", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function ScrapeWeb(url: string): Promise<string> {
  let content = "";
  try {
    // starting webscarpping with puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const pageHTML = await page.content();

    // use cheerio
    const $ = cheerio.load(pageHTML);
    const title = $('title').text();
    const body = $('body').text().trim();

    if (!title || !body) {
      throw new Error("Failed to extract meaningful content from the page.");
    }

    content = `
      Title: ${title}\n
      Website Info: ${body.slice(0, 4000)}`; // limiting the body length

    await browser.close();
    return content;
  } catch(error) {
    console.error("Error during web scraping: ", error);
    if (error === "Failed to extract meaningful content") {
      content = "The website's content could not be extracted. This may be due to restrictions or an unsupported page format.";
    } else {
      content = "There was an error when web scraping. The page might not be accessible or the server might be down.";
    }
  }
  return content;
}

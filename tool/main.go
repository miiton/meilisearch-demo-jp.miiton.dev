package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/cheggaaa/pb"
	"github.com/gocarina/gocsv"
)

type Date string

func (d *Date) String() string {
	return string(*d)
}

var client = http.DefaultClient

func convertDateToTimestamp(date string) (*int64, error) {
	if date == "" {
		return nil, nil
	}
	t, err := time.Parse("20060102", date)
	if err != nil {
		if err.(*time.ParseError).Message == ": day out of range" {
			d, err := strconv.Atoi(date)
			if err != nil {
				return nil, err
			}
			t, err = time.Parse("20060102", fmt.Sprint(d+1))
			if err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}
	// convert t.Unix() to bytes
	ts := t.Unix()
	return &ts, nil
}

type CulturalProperty struct {
	LedgerID                      string `csv:"ledger_id:number" json:"ledger_id,omitempty"`
	ID                            string `csv:"id:number" json:"id,omitempty"`
	Name                          string `csv:"name:string" json:"name,omitempty"`
	Building                      string `csv:"building:string" json:"building,omitempty"`
	Category1                     string `csv:"category1:string" json:"category_1,omitempty"`
	Category2                     string `csv:"category2:string" json:"category_2,omitempty"`
	Category3                     string `csv:"category3:string" json:"category_3,omitempty"`
	Country                       string `csv:"country:string" json:"country,omitempty"`
	Age                           string `csv:"age:string" json:"age,omitempty"`
	ImportantCulturalPropertyDate string `csv:"important_cultural_property_date:string" json:"important_cultural_property_date,omitempty"`
	NationalTreasureDate          string `csv:"national_treasure_date:string" json:"national_treasure_date,omitempty"`
	Prefecture                    string `csv:"pref:string" json:"prefecture,omitempty"`
	Address                       string `csv:"address:string" json:"address,omitempty"`
	Storage                       string `csv:"storage:string" json:"storage,omitempty"`
	Owner                         string `csv:"owner:string" json:"owner,omitempty"`
	Administrator                 string `csv:"administrator:string" json:"administrator,omitempty"`
	Latitude                      string `csv:"latitude:string" json:"latitude,omitempty"`
	Longtitude                    string `csv:"longtitude:string" json:"longtitude,omitempty"`
}

type MeiliDocument struct {
	ID                                 string `csv:"id:string" json:"id,omitempty"`
	LedgerID                           string `csv:"ledger_id:number" json:"ledger_id,omitempty"`
	ChildID                            string `csv:"child_id:number" json:"child_id,omitempty"`
	Name                               string `csv:"name:string" json:"name,omitempty"`
	Building                           string `csv:"building:string" json:"building,omitempty"`
	Category1                          string `csv:"category1:string" json:"category_1,omitempty"`
	Category2                          string `csv:"category2:string" json:"category_2,omitempty"`
	Category3                          string `csv:"category3:string" json:"category_3,omitempty"`
	Country                            string `csv:"country:string" json:"country,omitempty"`
	Age                                string `csv:"age:string" json:"age,omitempty"`
	Year                               string `csv:"year:string" json:"year,omitempty"`
	Explain                            string `csv:"explain:string" json:"explain,omitempty"`
	Detail                             string `csv:"detail:string" json:"detail,omitempty"`
	ImportantCulturalPropertyYear      string `csv:"important_cultural_property_year:string" json:"important_cultural_property_year,omitempty"`
	ImportantCulturalPropertyDate      string `csv:"important_cultural_property_date:string" json:"important_cultural_property_date,omitempty"`
	ImportantCulturalPropertyTimestamp *int64 `csv:"important_cultural_property_timestamp:number" json:"important_cultural_property_timestamp,omitempty"`
	NationalTreasureYear               string `csv:"national_treasure_year:string" json:"national_treasure_year,omitempty"`
	NationalTreasureDate               string `csv:"national_treasure_date:string" json:"national_treasure_date,omitempty"`
	NationalTreasureTimestamp          *int64 `csv:"national_treasure_timestamp:number" json:"national_treasure_timestamp,omitempty"`
	Prefecture                         string `csv:"prefecture:string" json:"prefecture,omitempty"`
	Address                            string `csv:"address:string" json:"address,omitempty"`
	Storage                            string `csv:"storage:string" json:"storage,omitempty"`
	Owner                              string `csv:"owner:string" json:"owner,omitempty"`
	Administrator                      string `csv:"administrator:string" json:"administrator,omitempty"`
	GEO                                struct {
		Lat string `json:"lat"`
		Lng string `json:"lng"`
	} `csv:"_geo:string" json:"_geo,omitempty"`
	Link string `csv:"link:string" json:"link,omitempty"`
}

func main() {
	os.Setenv("TZ", "Asia/Tokyo")
	// read csv used gocsv
	f, err := os.OpenFile("../tmp/list_of_cultural_properties_designated_by_the_Japanese_government.csv", os.O_RDONLY, os.ModePerm)
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
	var items []CulturalProperty
	err = gocsv.UnmarshalFile(f, &items)
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}

	var documents []MeiliDocument
	o, err := os.OpenFile("../tmp/converted.jsonl", os.O_WRONLY|os.O_CREATE|os.O_APPEND, os.ModePerm)
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
	defer o.Close()
	bar := pb.StartNew(len(items))
	defer bar.Finish()
	for i := 0; i < len(items); i++ {
		bar.Increment()
		var d MeiliDocument
		j, err := json.Marshal(items[i])
		if err != nil {
			log.Println(err)
			os.Exit(1)
		}
		err = json.Unmarshal(j, &d)
		if err != nil {
			log.Println(err)
			os.Exit(1)
		}
		if items[i].Latitude != "" && items[i].Longtitude != "" {
			d.GEO.Lat = items[i].Latitude
			d.GEO.Lng = items[i].Longtitude
		}
		if len(items[i].ImportantCulturalPropertyDate) == 8 {
			d.ImportantCulturalPropertyYear = items[i].ImportantCulturalPropertyDate[:4]
		}
		d.ImportantCulturalPropertyTimestamp, err = convertDateToTimestamp(items[i].ImportantCulturalPropertyDate)
		if err != nil {
			log.Println(err)
			os.Exit(1)
		}
		if len(items[i].NationalTreasureDate) == 8 {
			d.NationalTreasureYear = items[i].NationalTreasureDate[:4]
		}
		d.NationalTreasureTimestamp, err = convertDateToTimestamp(items[i].NationalTreasureDate)
		if err != nil {
			log.Println(err)
			os.Exit(1)
		}
		d.Link = "https://kunishitei.bunka.go.jp/heritage/detail/" + d.LedgerID + "/" + d.ID
		d.ChildID = items[i].ID
		d.ID = fmt.Sprintf("%s-%s", d.LedgerID, d.ChildID)
		d.Year, d.Explain, d.Detail, err = ScrapeBunkaDetail(d.Link)
		if err != nil {
			d.Link = "https://kunishitei.bunka.go.jp/heritage/detail/" + d.LedgerID[0:1] + "1" + d.LedgerID[2:3] + "/" + d.ChildID
			d.ChildID = items[i].ID
			d.ID = fmt.Sprintf("%s-%s", d.LedgerID, d.ChildID)
			d.Year, d.Explain, d.Detail, err = ScrapeBunkaDetail(d.Link)
			if err != nil {
				d.Link = "https://kunishitei.bunka.go.jp/heritage/detail/" + d.LedgerID[0:1] + "12" + "/" + d.ChildID
				d.ChildID = items[i].ID
				d.ID = fmt.Sprintf("%s-%s", d.LedgerID, d.ChildID)
				d.Year, d.Explain, d.Detail, err = ScrapeBunkaDetail(d.Link)
				if err != nil {
					log.Printf("%05d error: %s %s\n", i+1, d.Link, err.Error())
				}
			}
		}
		jsonData, err := json.Marshal(d)
		if err != nil {
			log.Printf("%05d error: %s %s\n", i+1, d.Link, err.Error())
		}

		o.WriteString(string(jsonData) + "\n")

		// log.Printf("%05d done: %s\n", i+1, d.Link)
		time.Sleep(250 * time.Millisecond)
	}
	err = gocsv.MarshalFile(documents, o)
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
}

func ScrapeBunkaDetail(link string) (year, explain, detail string, err error) {
	req, err := http.NewRequest("GET", link, nil)
	if err != nil {
		return "", "", "", err
	}
	res, err := client.Do(req)
	if err != nil {
		return "", "", "", err
	}
	defer res.Body.Close()
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return "", "", "", err
	}

	if res.ContentLength == 3393 {
		return "", "", "", fmt.Errorf("no data")
	}

	// Find the review items
	doc.Find(".heritage_detail_list tr").Each(func(i int, s *goquery.Selection) {
		// For each item found, get the band and title
		if strings.Contains(s.Text(), "写真一覧") {
			return
		}
		key := strings.TrimSpace(s.Find("td:nth-child(1)").Text())
		val := strings.TrimSpace(s.Find("td:nth-child(3)").Text())
		if key != "西暦" {
			year = val
		}
	})

	doc.Find("#detail_explanation_m").Each(func(i int, s *goquery.Selection) {
		explain = strings.TrimSpace(s.Find("tr:nth-child(2) td").Text())
	})

	doc.Find("#detail_explanation").Each(func(i int, s *goquery.Selection) {
		detail = strings.TrimSpace(s.Find("tr:nth-child(2) td").Text())
	})
	return
}
